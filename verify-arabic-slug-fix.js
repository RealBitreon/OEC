/**
 * Verification Script for Arabic Slug Fix
 * Run this after deployment to verify the fix works
 */

const PRODUCTION_URL = 'https://msoec.vercel.app'

// Test cases
const tests = [
  {
    name: 'Encoded Arabic Slug',
    url: '/competition/%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A9/participate',
    expectedStatus: [200, 404], // 200 if competition exists, 404 if not
    shouldNotRedirectTo: '/',
  },
  {
    name: 'Invalid Slug',
    url: '/competition/invalid-slug-12345/participate',
    expectedStatus: [200], // Should show 404 UI, not redirect
    shouldNotRedirectTo: '/',
  },
  {
    name: 'Home Page',
    url: '/',
    expectedStatus: [200],
  },
]

async function runTests() {
  console.log('🧪 Starting Arabic Slug Fix Verification\n')
  console.log(`Testing against: ${PRODUCTION_URL}\n`)

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`📝 Test: ${test.name}`)
      console.log(`   URL: ${test.url}`)

      const response = await fetch(PRODUCTION_URL + test.url, {
        redirect: 'manual', // Don't follow redirects
      })

      console.log(`   Status: ${response.status}`)

      // Check if status is expected
      if (test.expectedStatus.includes(response.status)) {
        console.log(`   ✅ Status check passed`)
      } else {
        console.log(`   ❌ Status check failed (expected ${test.expectedStatus.join(' or ')})`)
        failed++
        continue
      }

      // Check for unwanted redirects
      if (test.shouldNotRedirectTo) {
        const location = response.headers.get('location')
        if (location === test.shouldNotRedirectTo) {
          console.log(`   ❌ Unwanted redirect to ${location}`)
          failed++
          continue
        } else if (location) {
          console.log(`   ⚠️  Redirects to: ${location}`)
        } else {
          console.log(`   ✅ No redirect`)
        }
      }

      // Check response body for 404 UI
      if (response.status === 200) {
        const text = await response.text()
        if (test.url.includes('invalid-slug')) {
          if (text.includes('المسابقة غير موجودة') || text.includes('عذراً')) {
            console.log(`   ✅ Shows proper 404 UI`)
          } else {
            console.log(`   ⚠️  No 404 UI detected (might be valid competition)`)
          }
        }
      }

      passed++
      console.log(`   ✅ Test passed\n`)
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.message}\n`)
      failed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Results: ${passed} passed, ${failed} failed`)
  console.log('='.repeat(50))

  if (failed === 0) {
    console.log('\n✅ All tests passed! The fix is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.')
  }
}

// Run tests
runTests().catch(console.error)
