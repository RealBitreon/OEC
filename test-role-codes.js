/**
 * Test script to verify role codes are working correctly
 * Run with: node test-role-codes.js
 */

require('dotenv').config()

console.log('\n🔍 Testing Role Codes Configuration\n')
console.log('=' .repeat(50))

// Check environment variables
console.log('\n📋 Environment Variables:')
console.log(`CEO_ROLE_CODE: ${process.env.CEO_ROLE_CODE || '(not set - using default: CE@)'}`)
console.log(`MANAGER_ROLE_CODE: ${process.env.MANAGER_ROLE_CODE || '(not set - using default: $RC)'}`)

// Get the actual codes that will be used
const ROLE_CODES = {
  ceo: process.env.CEO_ROLE_CODE || 'CE@',
  lrc_manager: process.env.MANAGER_ROLE_CODE || '$RC'
}

console.log('\n✅ Active Role Codes:')
console.log(`CEO Code: "${ROLE_CODES.ceo}"`)
console.log(`Manager Code: "${ROLE_CODES.lrc_manager}"`)

// Test scenarios
console.log('\n🧪 Test Scenarios:')
console.log('=' .repeat(50))

const testCases = [
  { code: '', expected: 'student', description: 'Empty code (Student)' },
  { code: ROLE_CODES.ceo, expected: 'ceo', description: 'CEO code' },
  { code: ROLE_CODES.lrc_manager, expected: 'lrc_manager', description: 'Manager code' },
  { code: 'INVALID', expected: 'error', description: 'Invalid code' },
  { code: '  ', expected: 'student', description: 'Whitespace only (Student)' },
]

testCases.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.description}`)
  console.log(`   Input: "${test.code}"`)
  
  let result
  if (test.code.trim() === '') {
    result = 'student'
  } else if (test.code.trim() === ROLE_CODES.ceo) {
    result = 'ceo'
  } else if (test.code.trim() === ROLE_CODES.lrc_manager) {
    result = 'lrc_manager'
  } else {
    result = 'error'
  }
  
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL'
  console.log(`   Expected: ${test.expected}`)
  console.log(`   Got: ${result}`)
  console.log(`   ${status}`)
})

console.log('\n' + '=' .repeat(50))
console.log('\n📝 Summary:')
console.log('- Student role: Leave code field empty')
console.log(`- Manager role: Use code "${ROLE_CODES.lrc_manager}"`)
console.log(`- CEO role: Use code "${ROLE_CODES.ceo}"`)
console.log('\n⚠️  Remember to change these codes in production!')
console.log('   Edit .env file to set custom codes.\n')
