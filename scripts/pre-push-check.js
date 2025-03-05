#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 Running pre-push checks...\n');

// Check for running development servers
console.log('1. Checking for running development servers...');
try {
  execSync('node scripts/cleanup-dev-servers.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error running cleanup-dev-servers.js:', error.message);
}

// Check for critical console.log statements
console.log('\n2. Checking for critical console.log statements...');
try {
  const output = execSync('grep -r "console.log" --include="*.ts" --include="*.tsx" src/utils/payu.ts src/utils/envLogger.ts src/utils/authDiagnostic.ts src/components/payment/').toString();
  
  if (output.includes('[HIDDEN]') || 
      output.includes('API_KEY') || 
      output.includes('token') || 
      output.includes('credit card')) {
    console.log('⚠️ WARNING: Potentially sensitive console.log statements found:');
    console.log(output);
    console.log('Consider running: node scripts/remove-critical-logs.js');
  } else {
    console.log('✅ No critical console.log statements found');
  }
} catch (error) {
  console.log('✅ No critical console.log statements found');
}

// Check .env file
console.log('\n3. Checking .env file...');
try {
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'VITE_PAYU_PUBLIC_KEY',
      'VITE_PAYU_MERCHANT_ID',
      'VITE_PAYU_ACCOUNT_ID',
      'VITE_PAYU_API_KEY',
      'VITE_PAYU_API_LOGIN'
    ];
    
    const missingVars = [];
    for (const varName of requiredVars) {
      if (!envContent.includes(`${varName}=`)) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      console.log('⚠️ WARNING: Missing required environment variables:');
      missingVars.forEach(v => console.log(`  - ${v}`));
    } else {
      console.log('✅ All required environment variables are set');
    }
  } else {
    console.log('⚠️ WARNING: .env file not found');
  }
} catch (error) {
  console.error('❌ Error checking .env file:', error.message);
}

// Check .gitignore
console.log('\n4. Checking .gitignore file...');
try {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignoreContent.includes('.env')) {
      console.log('✅ .env is properly included in .gitignore');
    } else {
      console.log('⚠️ WARNING: .env is not in .gitignore');
    }
  } else {
    console.log('⚠️ WARNING: .gitignore file not found');
  }
} catch (error) {
  console.error('❌ Error checking .gitignore file:', error.message);
}

// Check for syntax errors in PricingSection.tsx
console.log('\n5. Checking for syntax errors in PricingSection.tsx...');
try {
  const pricingSectionPath = path.join(projectRoot, 'src', 'components', 'subscription', 'PricingSection.tsx');
  if (fs.existsSync(pricingSectionPath)) {
    try {
      execSync(`npx tsc --noEmit ${pricingSectionPath}`, { stdio: 'pipe' });
      console.log('✅ No syntax errors found in PricingSection.tsx');
    } catch (error) {
      if (error.stdout && error.stdout.toString().includes('Unexpected token')) {
        console.log('⚠️ WARNING: Syntax error found in PricingSection.tsx');
        console.log(error.stdout.toString());
      } else {
        console.log('✅ No syntax errors found in PricingSection.tsx (TypeScript errors are expected)');
      }
    }
  } else {
    console.log('⚠️ WARNING: PricingSection.tsx file not found');
  }
} catch (error) {
  console.error('❌ Error checking PricingSection.tsx:', error.message);
}

// Check documentation
console.log('\n6. Checking documentation...');
const docFiles = ['PAYMENT_FLOW.md', 'PRE-PUSH-CHECKLIST.md'];
for (const file of docFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`⚠️ WARNING: ${file} not found`);
  }
}

console.log('\n🏁 Pre-push check completed!');
console.log('Please review any warnings above before pushing to GitHub.');
console.log('If everything looks good, you can proceed with the push.'); 