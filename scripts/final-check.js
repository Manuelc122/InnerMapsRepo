import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 Running final pre-push checks...\n');

// Check for running development servers
try {
  console.log('Checking for running development servers...');
  const psOutput = execSync('ps aux | grep vite | grep -v grep').toString();
  console.log('⚠️ WARNING: Development servers are still running:');
  console.log(psOutput);
  console.log('Consider running: pkill -f "vite"\n');
} catch (error) {
  console.log('✅ No development servers running\n');
}

// Check for .env file
try {
  console.log('Checking .env file...');
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
  console.log('');
} catch (error) {
  console.error('Error checking .env file:', error);
}

// Check .gitignore
try {
  console.log('Checking .gitignore file...');
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
  console.log('');
} catch (error) {
  console.error('Error checking .gitignore file:', error);
}

// Check for remaining console.log statements
try {
  console.log('Checking for critical console.log statements...');
  const criticalLogsOutput = execSync('grep -r "console.log" --include="*.ts" --include="*.tsx" src/utils/payu.ts src/utils/envLogger.ts src/utils/authDiagnostic.ts src/components/payment/').toString();
  
  if (criticalLogsOutput.includes('[HIDDEN]') || 
      criticalLogsOutput.includes('API_KEY') || 
      criticalLogsOutput.includes('token') || 
      criticalLogsOutput.includes('credit card')) {
    console.log('⚠️ WARNING: Potentially sensitive console.log statements found:');
    console.log(criticalLogsOutput);
  } else {
    console.log('✅ No critical console.log statements found');
  }
  console.log('');
} catch (error) {
  if (error.status === 1) {
    console.log('✅ No critical console.log statements found');
  } else {
    console.error('Error checking for console.log statements:', error);
  }
  console.log('');
}

// Run linting check
try {
  console.log('Running linting check...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch (error) {
  console.log('⚠️ WARNING: Linting failed');
}

console.log('\n🏁 Final check completed!');
console.log('Please review the warnings above and complete any remaining items in the PRE-PUSH-CHECKLIST.md file.'); 