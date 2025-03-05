#!/usr/bin/env node

import { execSync } from 'child_process';
import { platform } from 'os';

console.log('🧹 Cleaning up development server instances...');

// Check for running servers
let serversRunning = false;
try {
  if (platform() === 'win32') {
    const output = execSync('tasklist /FI "WINDOWTITLE eq vite"').toString();
    serversRunning = output.includes('node.exe');
  } else {
    const output = execSync('ps aux | grep vite | grep -v grep').toString();
    serversRunning = output.length > 0;
  }
} catch (error) {
  // No servers found
  serversRunning = false;
}

// Stop servers if running
if (serversRunning) {
  try {
    if (platform() === 'win32') {
      console.log('Stopping Vite servers on Windows...');
      execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite"', { stdio: 'inherit' });
    } else {
      console.log('Stopping Vite servers on macOS/Linux...');
      execSync('pkill -f "vite"', { stdio: 'inherit' });
    }
    console.log('✅ All development servers stopped successfully');
  } catch (error) {
    console.error('❌ Error stopping development servers:', error.message);
  }
} else {
  console.log('✅ No Vite servers are currently running');
}

// Check for used ports
console.log('\nChecking for used development ports...');

const checkPort = (port) => {
  try {
    if (platform() === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`).toString();
      return output.length > 0;
    } else {
      const output = execSync(`lsof -i :${port}`).toString();
      return output.length > 0;
    }
  } catch (error) {
    return false;
  }
};

const developmentPorts = [5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180];
const usedPorts = developmentPorts.filter(port => checkPort(port));

if (usedPorts.length > 0) {
  console.log(`⚠️ The following development ports are still in use: ${usedPorts.join(', ')}`);
  console.log('You may want to restart your computer before pushing to GitHub if you cannot free these ports.');
} else {
  console.log('✅ No development ports are in use');
}

console.log('\n🏁 Cleanup completed!');
console.log('You can now safely push your changes to GitHub.'); 