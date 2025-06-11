#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to check
const checkDirs = ['app', 'components', 'lib'];

// Files to check
const fileExtensions = ['.tsx', '.ts', '.js', '.jsx'];

// Theme validation
const expectedTheme = 'yellow';
const oldTheme = 'green';

let totalFiles = 0;
let filesWithIssues = 0;
const issues = [];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileIssues = [];
    
    lines.forEach((line, index) => {
      // Check for old green color references
      const greenMatches = line.match(/green-\d+/g);
      if (greenMatches) {
        greenMatches.forEach(match => {
          fileIssues.push({
            line: index + 1,
            issue: `Found old green color: ${match}`,
            suggestion: match.replace('green-', 'yellow-')
          });
        });
      }
      
      // Check for hardcoded green colors
      const hardcodedGreen = line.match(/bg-green|text-green|border-green|from-green|to-green/g);
      if (hardcodedGreen) {
        hardcodedGreen.forEach(match => {
          fileIssues.push({
            line: index + 1,
            issue: `Found hardcoded green color: ${match}`,
            suggestion: match.replace('green', 'yellow')
          });
        });
      }
    });
    
    if (fileIssues.length > 0) {
      filesWithIssues++;
      issues.push({
        file: filePath,
        issues: fileIssues
      });
    }
    
    totalFiles++;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

function checkDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .next directories
        if (item !== 'node_modules' && item !== '.next' && !item.startsWith('.')) {
          checkDirectory(fullPath);
        }
      } else if (fileExtensions.some(ext => item.endsWith(ext))) {
        checkFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Main execution
console.log('🎨 Theme Consistency Checker');
console.log('============================');
console.log(`Checking for consistent ${expectedTheme} theme usage...`);
console.log('');

checkDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Checking directory: ${dir}`);
    checkDirectory(dir);
  }
});

// Report results
console.log('\n📊 Results');
console.log('===========');
console.log(`Total files checked: ${totalFiles}`);
console.log(`Files with theme issues: ${filesWithIssues}`);

if (issues.length === 0) {
  console.log('✅ All files are using consistent yellow theme!');
} else {
  console.log('\n⚠️  Issues found:');
  issues.forEach(fileIssue => {
    console.log(`\n📁 ${fileIssue.file}`);
    fileIssue.issues.forEach(issue => {
      console.log(`  Line ${issue.line}: ${issue.issue}`);
      console.log(`  Suggestion: ${issue.suggestion}`);
    });
  });
  
  console.log('\n🔧 Quick fix suggestion:');
  console.log('Run this PowerShell command to fix remaining issues:');
  issues.forEach(fileIssue => {
    console.log(`(Get-Content "${fileIssue.file}") -replace 'green-', 'yellow-' | Set-Content "${fileIssue.file}"`);
  });
}

console.log('\n🎯 Theme Configuration');
console.log('======================');
console.log('Your centralized theme is defined in: lib/theme.ts');
console.log('Use the componentThemes object for consistent styling:');
console.log('- componentThemes.button.primary');
console.log('- componentThemes.card');
console.log('- componentThemes.header');
console.log('- etc.');

process.exit(issues.length > 0 ? 1 : 0); 