#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Run this before deploying to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Pre-Deployment Verification...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment Variables
console.log('1️⃣  Checking environment variables...');
const envExample = fs.readFileSync('.env.example', 'utf8');
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CEO_ROLE_CODE',
  'MANAGER_ROLE_CODE'
];

const envExampleVars = envExample.match(/^[A-Z_]+=.*/gm) || [];
const definedVars = envExampleVars.map(line => line.split('=')[0]);

requiredVars.forEach(varName => {
  if (!definedVars.includes(varName)) {
    console.log(`   ❌ Missing required variable in .env.example: ${varName}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${varName}`);
  }
});

// Check 2: Critical Files
console.log('\n2️⃣  Checking critical files...');
const criticalFiles = [
  'proxy.ts',
  'next.config.js',
  'package.json',
  'lib/supabase/server.ts',
  'lib/supabase/client.ts',
  'lib/auth/supabase-auth.ts',
  'app/api/session/route.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ Missing: ${file}`);
    hasErrors = true;
  }
});

// Check 3: Proxy Configuration
console.log('\n3️⃣  Checking proxy configuration...');
const proxyContent = fs.readFileSync('proxy.ts', 'utf8');
if (proxyContent.includes('export async function proxy')) {
  console.log('   ✅ Proxy function correctly exported');
} else if (proxyContent.includes('export async function middleware')) {
  console.log('   ❌ Still using old "middleware" export - should be "proxy"');
  hasErrors = true;
} else {
  console.log('   ❌ No proxy/middleware function found');
  hasErrors = true;
}

// Check 4: Package.json Scripts
console.log('\n4️⃣  Checking build scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['build', 'start', 'dev'];

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`   ✅ ${script}: ${packageJson.scripts[script]}`);
  } else {
    console.log(`   ❌ Missing script: ${script}`);
    hasErrors = true;
  }
});

// Check 5: Next.js Config
console.log('\n5️⃣  Checking Next.js configuration...');
const nextConfig = fs.readFileSync('next.config.js', 'utf8');
if (nextConfig.includes('removeConsole')) {
  console.log('   ✅ Console removal configured for production');
} else {
  console.log('   ⚠️  Console statements will appear in production');
  hasWarnings = true;
}

// Check 6: TypeScript Config
console.log('\n6️⃣  Checking TypeScript configuration...');
if (fs.existsSync('tsconfig.json')) {
  console.log('   ✅ tsconfig.json exists');
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.strict) {
    console.log('   ✅ Strict mode enabled');
  } else {
    console.log('   ⚠️  Strict mode not enabled (optional - not a blocker)');
    hasWarnings = true;
  }
} else {
  console.log('   ❌ tsconfig.json missing');
  hasErrors = true;
}

// Check 7: .gitignore
console.log('\n7️⃣  Checking .gitignore...');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
const shouldIgnore = ['.env', 'node_modules', '.next'];

shouldIgnore.forEach(pattern => {
  if (gitignore.includes(pattern)) {
    console.log(`   ✅ ${pattern} ignored`);
  } else {
    console.log(`   ❌ ${pattern} not in .gitignore`);
    hasErrors = true;
  }
});

// Check 8: Dependencies
console.log('\n8️⃣  Checking critical dependencies...');
const criticalDeps = [
  '@supabase/supabase-js',
  '@supabase/ssr',
  'next',
  'react',
  'react-dom'
];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`   ❌ Missing dependency: ${dep}`);
    hasErrors = true;
  }
});

// Final Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VERIFICATION FAILED - Fix errors before deploying');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VERIFICATION PASSED WITH WARNINGS');
  console.log('   Review warnings but safe to deploy');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED - Ready for deployment!');
  process.exit(0);
}
