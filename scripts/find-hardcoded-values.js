#!/usr/bin/env node

/**
 * Script to find hardcoded values that should use the centralized config
 * 
 * Usage: node scripts/find-hardcoded-values.js
 */

const fs = require('fs');
const path = require('path');

// Patterns to search for
const patterns = [
  { name: 'Email addresses', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: 'Phone numbers', regex: /\+968\s*\d{4}\s*\d{4}/g },
  { name: 'School references (Arabic)', regex: /مدرسة\s+[\u0600-\u06FF\s]+/g },
  { name: 'Competition references', regex: /مسابقة\s+[\u0600-\u06FF\s]+/g },
];

// Directories to search
const searchDirs = ['app', 'components', 'lib'];

// Files to exclude
const excludePatterns = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /config\/site\.json/,
  /lib\/config\/site\.ts/,
  /scripts\//,
];

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => pattern.test(filePath));
}

function searchFile(filePath) {
  if (shouldExclude(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    patterns.forEach(({ name, regex }) => {
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        results.push({
          pattern: name,
          matches: [...new Set(matches)], // Remove duplicates
          file: filePath
        });
      }
    });
    
    return results.length > 0 ? results : null;
  } catch (error) {
    // Ignore read errors
    return null;
  }
}

function searchDirectory(dir) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results.push(...searchDirectory(fullPath));
      } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(item)) {
        const fileResults = searchFile(fullPath);
        if (fileResults) {
          results.push(...fileResults);
        }
      }
    });
  } catch (error) {
    // Ignore directory errors
  }
  
  return results;
}

console.log('🔍 Searching for hardcoded values that should use centralized config...\n');

const allResults = [];
searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    allResults.push(...searchDirectory(dir));
  }
});

if (allResults.length === 0) {
  console.log('✅ No hardcoded values found! All good.\n');
} else {
  console.log(`⚠️  Found ${allResults.length} potential hardcoded values:\n`);
  
  // Group by file
  const byFile = {};
  allResults.forEach(result => {
    if (!byFile[result.file]) {
      byFile[result.file] = [];
    }
    byFile[result.file].push(result);
  });
  
  Object.keys(byFile).forEach(file => {
    console.log(`📄 ${file}`);
    byFile[file].forEach(result => {
      console.log(`   ${result.pattern}:`);
      result.matches.forEach(match => {
        console.log(`      - ${match}`);
      });
    });
    console.log('');
  });
  
  console.log('💡 Consider migrating these values to config/site.json\n');
  console.log('📖 See config/MIGRATION_GUIDE.md for help\n');
}
