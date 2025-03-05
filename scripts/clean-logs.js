/**
 * Script to identify console.log statements that should be removed before pushing to GitHub
 * 
 * Usage:
 * 1. Run: node scripts/clean-logs.js
 * 2. Review the output and decide which logs to keep and which to remove
 * 
 * Categories:
 * - CRITICAL: Logs that contain sensitive information (API keys, tokens, etc.)
 * - DEBUGGING: Logs that are only useful during development
 * - INFO: Logs that provide useful information for production troubleshooting
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define patterns for different categories
const CRITICAL_PATTERNS = [
  'API_KEY',
  'TOKEN',
  'SECRET',
  'PASSWORD',
  'CREDENTIAL',
  'HIDDEN'
];

const DEBUGGING_PATTERNS = [
  'DEBUG',
  'TEST',
  'TESTING'
];

// Function to recursively get all files in a directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Function to check a file for console.log statements
function checkFileForConsoleLogs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const results = [];
  
  lines.forEach((line, index) => {
    if (line.includes('console.log')) {
      let category = 'INFO';
      
      // Check if this is a critical log
      if (CRITICAL_PATTERNS.some(pattern => line.toUpperCase().includes(pattern))) {
        category = 'CRITICAL';
      }
      // Check if this is a debugging log
      else if (DEBUGGING_PATTERNS.some(pattern => line.toUpperCase().includes(pattern))) {
        category = 'DEBUGGING';
      }
      
      results.push({
        filePath,
        lineNumber: index + 1,
        line: line.trim(),
        category
      });
    }
  });
  
  return results;
}

// Main function
function main() {
  // Start from the project root (one level up from scripts directory)
  const projectRoot = path.resolve(__dirname, '..');
  const allFiles = getAllFiles(projectRoot);
  let allResults = [];
  
  allFiles.forEach(file => {
    const results = checkFileForConsoleLogs(file);
    allResults = allResults.concat(results);
  });
  
  // Group results by category
  const groupedResults = {
    CRITICAL: [],
    DEBUGGING: [],
    INFO: []
  };
  
  allResults.forEach(result => {
    groupedResults[result.category].push(result);
  });
  
  // Print results
  console.log('=== CONSOLE.LOG STATEMENTS ANALYSIS ===\n');
  
  console.log('CRITICAL LOGS (SHOULD BE REMOVED):');
  if (groupedResults.CRITICAL.length === 0) {
    console.log('  None found');
  } else {
    groupedResults.CRITICAL.forEach(result => {
      console.log(`  ${result.filePath}:${result.lineNumber} - ${result.line}`);
    });
  }
  
  console.log('\nDEBUGGING LOGS (CONSIDER REMOVING):');
  if (groupedResults.DEBUGGING.length === 0) {
    console.log('  None found');
  } else {
    groupedResults.DEBUGGING.forEach(result => {
      console.log(`  ${result.filePath}:${result.lineNumber} - ${result.line}`);
    });
  }
  
  console.log('\nINFO LOGS (MAY BE USEFUL IN PRODUCTION):');
  console.log(`  ${groupedResults.INFO.length} logs found`);
  console.log('  Run with --verbose to see all info logs');
  
  console.log('\nSUMMARY:');
  console.log(`  Total console.log statements: ${allResults.length}`);
  console.log(`  Critical: ${groupedResults.CRITICAL.length}`);
  console.log(`  Debugging: ${groupedResults.DEBUGGING.length}`);
  console.log(`  Info: ${groupedResults.INFO.length}`);
  
  console.log('\nRECOMMENDATION:');
  console.log('  1. Remove all CRITICAL logs');
  console.log('  2. Consider removing DEBUGGING logs');
  console.log('  3. Review INFO logs and decide which ones to keep');
}

main(); 