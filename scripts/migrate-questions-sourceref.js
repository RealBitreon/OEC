/**
 * Migration script to add sourceRef to existing questions
 * Run with: node scripts/migrate-questions-sourceref.js
 */

const fs = require('fs')
const path = require('path')

const questionsPath = path.join(__dirname, '..', 'data', 'questions.json')

function migrateQuestions() {
  console.log('🔄 Starting questions migration...')
  
  // Read existing questions
  const data = fs.readFileSync(questionsPath, 'utf8')
  const questions = JSON.parse(data)
  
  let migratedCount = 0
  let alreadyMigratedCount = 0
  
  // Migrate each question
  const migratedQuestions = questions.map(q => {
    // Check if already has sourceRef
    if (q.sourceRef && q.sourceRef.volume !== undefined) {
      alreadyMigratedCount++
      return q
    }
    
    // Add default sourceRef
    migratedCount++
    return {
      ...q,
      sourceRef: {
        volume: '',
        page: '',
        lineFrom: 0,
        lineTo: 0
      }
    }
  })
  
  // Write back to file
  fs.writeFileSync(questionsPath, JSON.stringify(migratedQuestions, null, 2), 'utf8')
  
  console.log(`✅ Migration complete!`)
  console.log(`   - Migrated: ${migratedCount} questions`)
  console.log(`   - Already had sourceRef: ${alreadyMigratedCount} questions`)
  console.log(`   - Total: ${questions.length} questions`)
}

// Run migration
try {
  migrateQuestions()
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}
