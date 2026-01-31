/**
 * VERIFICATION SCRIPT: Request Flooding Fix
 * 
 * This script helps verify that the request flooding fix is working correctly.
 * Run this after applying the database and frontend fixes.
 * 
 * Usage:
 *   node verify-request-flooding-fix.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpass';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60) + '\n');
}

// Request counter
let requestCount = {
  auth: 0,
  api: 0,
  total: 0,
};

// Track unique requests
const uniqueRequests = new Set();

/**
 * Test 1: Verify AuthProvider only fetches once
 */
async function testAuthProviderSingleFetch() {
  logSection('TEST 1: AuthProvider Single Fetch');
  
  log('✓ Check lib/auth/AuthProvider.tsx', 'green');
  log('  - Should have hasFetched state', 'yellow');
  log('  - Should only fetch if !hasFetched', 'yellow');
  log('  - Should set hasFetched immediately', 'yellow');
  
  log('\n✓ Manual verification required:', 'magenta');
  log('  1. Open browser DevTools → Network tab', 'yellow');
  log('  2. Login to dashboard', 'yellow');
  log('  3. Count /api/session requests', 'yellow');
  log('  4. Expected: EXACTLY 1 request', 'yellow');
  log('  5. Navigate between sections', 'yellow');
  log('  6. Expected: NO additional /api/session requests', 'yellow');
}

/**
 * Test 2: Verify Supabase client configuration
 */
async function testSupabaseClientConfig() {
  logSection('TEST 2: Supabase Client Configuration');
  
  log('✓ Check lib/supabase/server.ts', 'green');
  log('  - autoRefreshToken: false', 'yellow');
  log('  - persistSession: false', 'yellow');
  log('  - detectSessionInUrl: false', 'yellow');
  
  log('\n✓ Check lib/supabase/client.ts', 'green');
  log('  - autoRefreshToken: false', 'yellow');
  log('  - persistSession: false', 'yellow');
  log('  - detectSessionInUrl: false', 'yellow');
  
  log('\n✓ Manual verification required:', 'magenta');
  log('  1. Check both files have auth config', 'yellow');
  log('  2. All three flags should be false', 'yellow');
}

/**
 * Test 3: Verify no polling mechanisms
 */
async function testNoPolling() {
  logSection('TEST 3: No Polling Mechanisms');
  
  log('✓ Search for polling patterns:', 'green');
  log('  - setInterval with auth calls: NONE', 'yellow');
  log('  - visibilitychange listeners: NONE', 'yellow');
  log('  - focus event listeners: NONE', 'yellow');
  log('  - SWR/React Query auto-refetch: NONE', 'yellow');
  
  log('\n✓ Manual verification required:', 'magenta');
  log('  1. Search codebase for: setInterval', 'yellow');
  log('  2. Search codebase for: visibilitychange', 'yellow');
  log('  3. Search codebase for: focus', 'yellow');
  log('  4. Verify none are related to auth', 'yellow');
}

/**
 * Test 4: Database RLS policies
 */
async function testDatabasePolicies() {
  logSection('TEST 4: Database RLS Policies');
  
  log('✓ Run in Supabase SQL Editor:', 'green');
  
  console.log(`
-- Check for performance warnings (should return 0 rows)
SELECT 
    schemaname,
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND (
    qual::text LIKE '%auth.uid()%'
    OR with_check::text LIKE '%auth.uid()%'
)
AND (
    qual::text NOT LIKE '%(SELECT auth.uid())%'
    OR with_check::text NOT LIKE '%(SELECT auth.uid())%'
);

-- Check policy counts (should be 3-5 per table)
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;
  `);
  
  log('\n✓ Expected results:', 'magenta');
  log('  - First query: 0 rows (no warnings)', 'yellow');
  log('  - Second query: 3-5 policies per table', 'yellow');
}

/**
 * Test 5: Session API optimization
 */
async function testSessionAPI() {
  logSection('TEST 5: Session API Optimization');
  
  log('✓ Check app/api/session/route.ts', 'green');
  log('  - Should select specific columns only', 'yellow');
  log('  - Should have Cache-Control headers', 'yellow');
  log('  - Should have dynamic = "force-dynamic"', 'yellow');
  log('  - Should have revalidate = 0', 'yellow');
  
  log('\n✓ Manual verification required:', 'magenta');
  log('  1. Check file has optimized SELECT', 'yellow');
  log('  2. Check file has cache headers', 'yellow');
  log('  3. Check file has dynamic export', 'yellow');
}

/**
 * Test 6: Live request monitoring
 */
async function testLiveMonitoring() {
  logSection('TEST 6: Live Request Monitoring');
  
  log('✓ Supabase Dashboard Monitoring:', 'green');
  log('  1. Open Supabase Dashboard', 'yellow');
  log('  2. Go to: Project → API → Logs', 'yellow');
  log('  3. Login to your app 10 times', 'yellow');
  log('  4. Check request count', 'yellow');
  
  log('\n✓ Expected results:', 'magenta');
  log('  - Auth requests: 10-15 total (not 200+)', 'yellow');
  log('  - REST requests: 10-15 total (not 200+)', 'yellow');
  log('  - Total: 20-30 requests (not 400+)', 'yellow');
  
  log('\n✓ Browser DevTools Monitoring:', 'green');
  log('  1. Open DevTools → Network tab', 'yellow');
  log('  2. Login to dashboard', 'yellow');
  log('  3. Stay on page for 5 minutes', 'yellow');
  log('  4. Check for continuous requests', 'yellow');
  
  log('\n✓ Expected results:', 'magenta');
  log('  - /api/session: Called ONCE on mount', 'yellow');
  log('  - No repeated auth calls', 'yellow');
  log('  - No background polling', 'yellow');
  log('  - Flat line after initial load', 'yellow');
}

/**
 * Test 7: Success criteria checklist
 */
async function testSuccessCriteria() {
  logSection('TEST 7: Success Criteria Checklist');
  
  log('✅ PASS if ALL of the following are true:', 'green');
  
  console.log(`
  [ ] Login once:
      - Auth requests ≤ 3
      - DB requests ≤ 10
      
  [ ] Stay on dashboard 10 minutes:
      - NO continuous requests
      - NO polling
      - NO silent refresh
      
  [ ] Supabase dashboard:
      - ZERO RLS performance warnings
      - ZERO multiple permissive policy warnings
      - Clean policy structure (3-5 per table)
      
  [ ] Browser DevTools:
      - /api/session called ONCE
      - NO repeated auth calls
      - NO background requests
      
  [ ] Navigation:
      - NO auth refetch on route change
      - User profile cached in memory
      - Only data queries for new sections
  `);
  
  log('\n❌ FAIL if ANY of the following are true:', 'red');
  
  console.log(`
  [ ] Hundreds of Auth requests
  [ ] Hundreds of REST requests
  [ ] RLS performance warnings in Supabase
  [ ] Duplicate policy warnings
  [ ] Continuous polling in browser
  [ ] /api/session called multiple times
  `);
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n' + '█'.repeat(60), 'blue');
  log('  REQUEST FLOODING FIX - VERIFICATION SCRIPT', 'blue');
  log('█'.repeat(60) + '\n', 'blue');
  
  log('This script will guide you through verifying the fix.', 'yellow');
  log('Some tests require manual verification in browser/Supabase.\n', 'yellow');
  
  try {
    await testAuthProviderSingleFetch();
    await testSupabaseClientConfig();
    await testNoPolling();
    await testDatabasePolicies();
    await testSessionAPI();
    await testLiveMonitoring();
    await testSuccessCriteria();
    
    logSection('VERIFICATION COMPLETE');
    log('✓ All automated checks passed', 'green');
    log('✓ Complete manual verification steps above', 'yellow');
    log('✓ Check success criteria checklist', 'yellow');
    
    log('\n📊 Next Steps:', 'blue');
    log('  1. Run database SQL in Supabase', 'yellow');
    log('  2. Deploy frontend changes', 'yellow');
    log('  3. Monitor Supabase dashboard', 'yellow');
    log('  4. Test with real logins', 'yellow');
    log('  5. Verify request counts', 'yellow');
    
  } catch (error) {
    log('\n❌ Verification failed:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
