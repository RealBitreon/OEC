#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks for common issues before deploying to Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vercel Build Verification\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment Variables
console.log('1️⃣  Checking environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'CEO_ROLE_CODE',
  'MANAGER_ROLE_CODE',
];

const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.error('   ❌ .env file not found');
  hasErrors = true;
} else {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (!regex.test(envContent)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('   ❌ Missing required environment variables:');
    missingVars.forEach(v => console.error(`      - ${v}`));
    hasErrors = true;
  } else {
    console.log('   ✅ All required environment variables present');
  }
  
  // Check for spaces in env vars
  if (envContent.includes(' = ')) {
    console.warn('   ⚠️  Warning: Found spaces around = in .env (should be VAR=value)');
    hasWarnings = true;
  }
}

// Check 2: next.config.js
console.log('\n2️⃣  Checking next.config.js...');
const nextConfigPath = path.join(__dirname, 'next.config.js');
if (!fs.existsSync(nextConfigPath)) {
  console.error('   ❌ next.config.js not found');
  hasErrors = true;
} else {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Check for dev-only configs that might break production
  if (configContent.includes('allowedDevOrigins')) {
    console.warn('   ⚠️  Warning: allowedDevOrigins found (dev-only config)');
    hasWarnings = true;
  }
  
  console.log('   ✅ next.config.js exists');
}

// Check 3: package.json
console.log('\n3️⃣  Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.error('   ❌ package.json not found');
  hasErrors = true;
} else {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (!pkg.scripts || !pkg.scripts.build) {
    console.error('   ❌ Missing "build" script in package.json');
    hasErrors = true;
  } else {
    console.log('   ✅ Build script found');
  }
  
  // Check Next.js version
  if (pkg.dependencies && pkg.dependencies.next) {
    console.log(`   ℹ️  Next.js version: ${pkg.dependencies.next}`);
  }
}

// Check 4: TypeScript config
console.log('\n4️⃣  Checking tsconfig.json...');
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.warn('   ⚠️  tsconfig.json not found (optional for JS projects)');
  hasWarnings = true;
} else {
  const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
  const tsconfig = JSON.parse(tsconfigContent);
  
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.jsx === 'react-jsx') {
    console.warn('   ⚠️  jsx: "react-jsx" should be "preserve" for Next.js');
    hasWarnings = true;
  } else if (tsconfig.compilerOptions && tsconfig.compilerOptions.jsx === 'preserve') {
    console.log('   ✅ jsx: "preserve" configured correctly');
  }
  
  console.log('   ✅ tsconfig.json exists');
}

// Check 5: Critical files
console.log('\n5️⃣  Checking critical files...');
const criticalFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ Missing: ${file}`);
    hasErrors = true;
  }
});

if (!hasErrors) {
  console.log('   ✅ All critical files present');
}

// Check 6: node_modules
console.log('\n6️⃣  Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('   ❌ node_modules not found. Run: npm install');
  hasErrors = true;
} else {
  console.log('   ✅ node_modules exists');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ VERIFICATION FAILED');
  console.error('Fix the errors above before deploying to Vercel');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  VERIFICATION PASSED WITH WARNINGS');
  console.warn('Review warnings above (may cause issues)');
  console.log('\n✅ Ready to build. Run: npm run build');
  process.exit(0);
} else {
  console.log('✅ VERIFICATION PASSED');
  console.log('All checks passed! Ready to deploy to Vercel');
  console.log('\nNext steps:');
  console.log('1. Run: npm run build');
  console.log('2. If build succeeds, deploy to Vercel');
  console.log('3. Add env vars to Vercel Dashboard');
  process.exit(0);
}
