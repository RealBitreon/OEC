#!/usr/bin/env node

/**
 * Dashboard API Test Script
 * Tests the fixed API endpoints to verify they work correctly
 * 
 * Usage: node test-dashboard-api.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`   ✅ Success`);
      console.log(`   Data keys:`, Object.keys(data));
      
      // Show data summary
      if (data.competitions) {
        console.log(`   Competitions: ${data.competitions.length}`);
      }
      if (data.winners) {
        console.log(`   Winners: ${data.winners.length}`);
      }
      if (data.message) {
        console.log(`   Message: ${data.message}`);
      }
    } else {
      console.log(`   ⚠️  Error Response`);
      if (data.error) {
        console.log(`   Error: ${data.error}`);
      }
    }
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`   ❌ Request Failed`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Dashboard API Tests');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  
  const tests = [
    {
      name: 'Archived Competitions',
      url: `${BASE_URL}/api/competitions/archived`
    },
    {
      name: 'Winners List',
      url: `${BASE_URL}/api/winners`
    },
    {
      name: 'Active Competitions',
      url: `${BASE_URL}/api/competitions/active`
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    results.push({ ...test, ...result });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error || `Status ${r.status}`}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Check for specific errors
  const hasColumnErrors = results.some(r => 
    r.data?.error?.includes('does not exist') || 
    r.data?.error?.includes('column')
  );
  
  if (hasColumnErrors) {
    console.log('\n⚠️  COLUMN ERRORS DETECTED');
    console.log('   Check your database schema matches the queries');
    console.log('   See DASHBOARD_LOADING_INFINITE_FIX.md for details');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
