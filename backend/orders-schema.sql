-- Run this in your Supabase SQL Editor

-- 1. Create the orders table (as provided by you)
CREATE TABLE IF NOT EXISTS public.orders (
  id serial not null,
  order_id text null,
  order_date text null,
  ship_date text null,
  ship_mode text null,
  customer_name text null,
  segment text null,
  state text null,
  country text null,
  market text null,
  region text null,
  product_id text null,
  category text null,
  sub_category text null,
  product_name text null,
  sales numeric null,
  quantity integer null,
  discount numeric null,
  profit numeric null,
  shipping_cost numeric null,
  order_priority text null,
  year integer null,
  constraint orders_pkey primary key (id)
) TABLESPACE pg_default;

-- 2. Create the RPC function to get aggregated stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
DECLARE
  total_sales numeric;
  total_profit numeric;
  avg_shipping numeric;
  avg_ship_days numeric;
  ship_mode_data json;
  segment_data json;
  market_data json;
  result json;
BEGIN
  -- 1. Calculate main aggregates
  SELECT 
    COALESCE(SUM(sales), 0),
    COALESCE(SUM(profit), 0),
    COALESCE(AVG(shipping_cost), 0),
    COALESCE(AVG( (ship_date::date - order_date::date) ), 0)
  INTO 
    total_sales, 
    total_profit, 
    avg_shipping,
    avg_ship_days
  FROM public.orders;

  -- 2. Calculate ship_mode distribution (for Pie Chart)
  SELECT json_agg(row_to_json(t)) INTO ship_mode_data
  FROM (
    SELECT COALESCE(ship_mode, 'Unknown') as name, count(*) as value
    FROM public.orders
    GROUP BY ship_mode
  ) t;

  -- 3. Calculate segment distribution (for Pie Chart)
  SELECT json_agg(row_to_json(t)) INTO segment_data
  FROM (
    SELECT COALESCE(segment, 'Unknown') as name, count(*) as value
    FROM public.orders
    GROUP BY segment
  ) t;

  -- 4. Calculate market distribution (for Bar Chart)
  SELECT json_agg(row_to_json(t)) INTO market_data
  FROM (
    SELECT COALESCE(market, 'Unknown') as name, count(*) as value
    FROM public.orders
    GROUP BY market
  ) t;

  -- Build JSON response
  result := json_build_object(
    'total_sales', total_sales,
    'total_profit', total_profit,
    'avg_shipping_cost', avg_shipping,
    'avg_shipping_days', avg_ship_days,
    'ship_mode_data', COALESCE(ship_mode_data, '[]'::json),
    'segment_data', COALESCE(segment_data, '[]'::json),
    'market_data', COALESCE(market_data, '[]'::json)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Yearly orders RPC
CREATE OR REPLACE FUNCTION get_yearly_orders()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT 
      COALESCE(year, 0) as name, 
      COUNT(DISTINCT order_id) as orders,
      COALESCE(SUM(sales), 0) as sales
    FROM public.orders
    GROUP BY year
    ORDER BY year ASC
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 4. Top countries RPC
CREATE OR REPLACE FUNCTION get_top_countries()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT 
      COALESCE(country, 'Unknown') as name, 
      COALESCE(SUM(sales), 0) as sales,
      COUNT(DISTINCT order_id) as orders
    FROM public.orders
    GROUP BY country
    ORDER BY sales DESC
    LIMIT 10
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 5. States by country RPC
CREATE OR REPLACE FUNCTION get_states_by_country(p_country text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT 
      COALESCE(state, 'Unknown') as name, 
      COALESCE(SUM(sales), 0) as sales,
      COUNT(DISTINCT order_id) as orders
    FROM public.orders
    WHERE country = p_country
    GROUP BY state
    ORDER BY sales DESC
    LIMIT 10
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 6. Top categories RPC
CREATE OR REPLACE FUNCTION get_top_categories()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT 
      COALESCE(category, 'Unknown') as name, 
      COALESCE(SUM(sales), 0) as sales,
      COUNT(DISTINCT order_id) as orders
    FROM public.orders
    GROUP BY category
    ORDER BY sales DESC
    LIMIT 10
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 7. Subcategories by category RPC
CREATE OR REPLACE FUNCTION get_subcategories_by_category(p_category text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT 
      COALESCE(sub_category, 'Unknown') as name, 
      COALESCE(SUM(sales), 0) as sales,
      COUNT(DISTINCT order_id) as orders
    FROM public.orders
    WHERE category = p_category
    GROUP BY sub_category
    ORDER BY sales DESC
    LIMIT 10
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 8. Products by subcategory RPC
CREATE OR REPLACE FUNCTION get_products_by_subcategory(p_subcategory text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT 
      COALESCE(product_name, 'Unknown') as name, 
      COALESCE(SUM(sales), 0) as sales,
      COUNT(DISTINCT order_id) as orders
    FROM public.orders
    WHERE sub_category = p_subcategory
    GROUP BY product_name
    ORDER BY sales DESC
    LIMIT 10
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 9. Regions sorted RPC
CREATE OR REPLACE FUNCTION get_regions_sorted(p_sort_dir text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  IF lower(p_sort_dir) = 'asc' THEN
    SELECT json_agg(row_to_json(t)) INTO result
    FROM (
      SELECT 
        COALESCE(region, 'Unknown') as name, 
        COALESCE(SUM(sales), 0) as sales,
        COUNT(DISTINCT order_id) as orders
      FROM public.orders
      GROUP BY region
      ORDER BY sales ASC
    ) t;
  ELSE
    SELECT json_agg(row_to_json(t)) INTO result
    FROM (
      SELECT 
        COALESCE(region, 'Unknown') as name, 
        COALESCE(SUM(sales), 0) as sales,
        COUNT(DISTINCT order_id) as orders
      FROM public.orders
      GROUP BY region
      ORDER BY sales DESC
    ) t;
  END IF;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 10. Get aggregated daily sales for forecasting
CREATE OR REPLACE FUNCTION get_daily_sales()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT order_date, SUM(sales) as total_sales
    FROM public.orders
    GROUP BY order_date
    ORDER BY order_date ASC
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

