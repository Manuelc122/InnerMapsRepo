import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// List of critical logs to remove
const criticalLogs = [
  {
    file: 'scripts/check_db_connection.js',
    line: 15,
    pattern: /console\.log\('VITE_OPENAI_API_KEY:'.+\);/
  },
  {
    file: 'scripts/process_summaries.js',
    line: 19,
    pattern: /console\.log\('VITE_OPENAI_API_KEY:'.+\);/
  },
  {
    file: 'scripts/prompt_service_key.js',
    line: 51,
    pattern: /console\.log\('Project Settings > API > service_role secret\\n'\);/
  },
  {
    file: 'src/components/payment/PayUButton.tsx',
    line: 146,
    pattern: /console\.log\(`\[PAYU_BUTTON\] - \${key}: \[HIDDEN\]`\);/
  },
  {
    file: 'src/components/payment/SubscriptionForm.tsx',
    line: 250,
    pattern: /console\.log\('\[SUBSCRIPTION\] Created credit card token:'.+\);/
  },
  {
    file: 'src/utils/authDiagnostic.ts',
    line: 19,
    pattern: /console\.log\(`- Auth Token \(\${sbKey}\):`.+\);/
  },
  {
    file: 'src/utils/authDiagnostic.ts',
    line: 33,
    pattern: /console\.log\('- Token Status: ❌ EXPIRED'\);/
  },
  {
    file: 'src/utils/authDiagnostic.ts',
    line: 35,
    pattern: /console\.log\('- Token Status: ✅ Valid'\);/
  },
  {
    file: 'src/utils/envLogger.ts',
    line: 11,
    pattern: /console\.log\('VITE_DEEPSEEK_API_KEY:'.+\);/
  },
  {
    file: 'src/utils/envLogger.ts',
    line: 12,
    pattern: /console\.log\('VITE_OPENAI_API_KEY:'.+\);/
  },
  {
    file: 'src/utils/memory/summaryService.ts',
    line: 14,
    pattern: /console\.log\('Using OpenAI API key:'.+\);/
  },
  {
    file: 'src/utils/payu.ts',
    line: 89,
    pattern: /console\.log\('\[PAYU_SERVICE\] API Key:'.+\);/
  },
  {
    file: 'src/utils/payu.ts',
    line: 90,
    pattern: /console\.log\('\[PAYU_SERVICE\] API Login:'.+\);/
  },
  {
    file: 'src/utils/payu.ts',
    line: 143,
    pattern: /console\.log\('\[PAYU_SERVICE\] API Key:'.+\);/
  },
  {
    file: 'src/utils/payu.ts',
    line: 362,
    pattern: /console\.log\('\[PAYU_SERVICE\] Creating credit card token for customer:'.+\);/
  },
  {
    file: 'src/utils/payu.ts',
    line: 384,
    pattern: /console\.log\('\[PAYU_SERVICE\] Credit card data:'.+\);/
  }
];

// Function to remove a console.log statement from a file
function removeConsoleLog(filePath, pattern) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Replace the console.log statement with a comment
    content = content.replace(pattern, '// Removed console.log with sensitive information');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      return true;
    } else {
      console.log(`Pattern not found in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function to remove all critical logs
function removeCriticalLogs() {
  console.log('Removing critical console.log statements...');
  let successCount = 0;
  let failCount = 0;
  
  for (const log of criticalLogs) {
    console.log(`Processing ${log.file}:${log.line}...`);
    const success = removeConsoleLog(log.file, log.pattern);
    if (success) {
      successCount++;
      console.log(`✅ Removed console.log from ${log.file}:${log.line}`);
    } else {
      failCount++;
      console.log(`❌ Failed to remove console.log from ${log.file}:${log.line}`);
    }
  }
  
  console.log('\nSummary:');
  console.log(`Total critical logs: ${criticalLogs.length}`);
  console.log(`Successfully removed: ${successCount}`);
  console.log(`Failed to remove: ${failCount}`);
}

// Run the main function
removeCriticalLogs(); 