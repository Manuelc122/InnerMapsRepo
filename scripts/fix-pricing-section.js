import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the PricingSection.tsx file
const pricingSectionPath = path.join(__dirname, '..', 'src', 'components', 'subscription', 'PricingSection.tsx');

// Read the file
console.log(`Reading file: ${pricingSectionPath}`);
let content = fs.readFileSync(pricingSectionPath, 'utf8');

// Look for the problematic section around line 250
const problemPattern = /\) : \(/g;
const fixedContent = content.replace(problemPattern, ') : (');

// Check for unbalanced parentheses and braces
let parenCount = 0;
let braceCount = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '(') parenCount++;
  if (content[i] === ')') parenCount--;
  if (content[i] === '{') braceCount++;
  if (content[i] === '}') braceCount--;
  
  // If we find an imbalance, log the position
  if (parenCount < 0 || braceCount < 0) {
    const lines = content.substring(0, i).split('\n');
    console.log(`Imbalance found at line ${lines.length}, character ${i - content.lastIndexOf('\n', i)}`);
    console.log(`Character: ${content[i]}`);
    console.log(`Context: ${content.substring(i - 20, i + 20)}`);
    break;
  }
}

console.log(`Parentheses balance: ${parenCount}`);
console.log(`Braces balance: ${braceCount}`);

// Write the fixed content back to the file
fs.writeFileSync(pricingSectionPath, fixedContent, 'utf8');
console.log('File updated successfully.'); 