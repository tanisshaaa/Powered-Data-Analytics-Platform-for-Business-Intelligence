const fs = require('fs');
const path = require('path');

const configContent = `export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/_/backend' : 'http://localhost:5000');\n`;
fs.writeFileSync(path.join(__dirname, 'src', 'config.ts'), configContent);

const files = [
  'src/components/Navbar.tsx',
  'src/components/DashboardPage.tsx',
  'src/components/ForecastingPage.tsx',
  'src/components/AnomalyPage.tsx',
  'src/components/ChatbotPage.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('import { API_BASE }')) {
    content = `import { API_BASE } from '../config';\n` + content;
  }
  
  // Replace 'http://localhost:5000/api...' with `${API_BASE}/api...`
  content = content.replace(/'http:\/\/localhost:5000\/([^']+)'/g, '`${API_BASE}/$1`');
  content = content.replace(/"http:\/\/localhost:5000\/([^"]+)"/g, '`${API_BASE}/$1`');
  // Handle existing template literals `http://localhost:5000/api...` -> `${API_BASE}/api...`
  content = content.replace(/`http:\/\/localhost:5000\/([^`]+)`/g, '`${API_BASE}/$1`');
  
  fs.writeFileSync(filePath, content);
}
console.log('Fixed URLs in all components.');
