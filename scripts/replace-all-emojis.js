/**
 * Script to replace all emojis with Lucide React icons
 * Run with: node scripts/replace-all-emojis.js
 */

const fs = require('fs');
const path = require('path');

// Emoji to Icon mapping
const emojiMap = {
  '📞': { icon: 'phone', import: 'Phone' },
  '📱': { icon: 'smartphone', import: 'Smartphone' },
  '📍': { icon: 'location', import: 'MapPin' },
  '📧': { icon: 'mail', import: 'Mail' },
  '💬': { icon: 'message', import: 'MessageCircle' },
  '🏫': { icon: 'school', import: 'School' },
  '👨‍💼': { icon: 'briefcase', import: 'Briefcase' },
  '👨‍🏫': { icon: 'graduation', import: 'GraduationCap' },
  '💻': { icon: 'code', import: 'Code' },
  '📚': { icon: 'book', import: 'BookOpen' },
  '📝': { icon: 'file', import: 'FileText' },
  '✅': { icon: 'check', import: 'CheckCircle2' },
  '❌': { icon: 'cross', import: 'XCircle' },
  '⚠️': { icon: 'warning', import: 'AlertTriangle' },
  '💡': { icon: 'lightbulb', import: 'Lightbulb' },
  '🎯': { icon: 'target', import: 'Target' },
  '🏆': { icon: 'trophy', import: 'Trophy' },
  '🎓': { icon: 'graduation', import: 'GraduationCap' },
  '⏳': { icon: 'clock', import: 'Clock' },
  '🔒': { icon: 'lock', import: 'Lock' },
  '📅': { icon: 'calendar', import: 'Calendar' },
  '🎲': { icon: 'dice', import: 'Dices' },
  '▶️': { icon: 'play', import: 'Play' },
  '⏸️': { icon: 'pause', import: 'Pause' },
  '🎩': { icon: 'sparkles', import: 'Sparkles' },
  '📌': { icon: 'pin', import: 'Pin' },
  '🎁': { icon: 'gift', import: 'Gift' },
  '❓': { icon: 'question', import: 'HelpCircle' },
  '🔍': { icon: 'search', import: 'Search' },
  '📊': { icon: 'chart', import: 'BarChart3' },
  '⚖️': { icon: 'scale', import: 'Scale' },
  '🌟': { icon: 'star', import: 'Star' },
  '⚡': { icon: 'zap', import: 'Zap' },
  '👤': { icon: 'user', import: 'User' },
  '✨': { icon: 'sparkles', import: 'Sparkles' },
  '🎪': { icon: 'party', import: 'PartyPopper' },
};

// Size mapping from text-* to w-* h-*
const sizeMap = {
  'text-xl': 'w-5 h-5',
  'text-2xl': 'w-6 h-6',
  'text-3xl': 'w-8 h-8',
  'text-4xl': 'w-10 h-10',
  'text-5xl': 'w-12 h-12',
  'text-6xl': 'w-16 h-16',
  'text-7xl': 'w-20 h-20',
  'text-8xl': 'w-24 h-24',
};

function replaceEmojisInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let needsIconImport = false;

  // Check if file already has Icons import
  const hasIconsImport = content.includes("import Icons from '@/components/icons'");

  // Replace emoji patterns
  Object.entries(emojiMap).forEach(([emoji, { icon }]) => {
    // Pattern 1: <span className="text-*">emoji</span>
    const spanPattern = new RegExp(
      `<span className="([^"]*text-\\d+xl[^"]*)">\\s*${emoji}\\s*</span>`,
      'g'
    );
    
    if (spanPattern.test(content)) {
      content = content.replace(spanPattern, (match, className) => {
        const size = Object.keys(sizeMap).find(s => className.includes(s)) || 'text-4xl';
        const iconSize = sizeMap[size];
        needsIconImport = true;
        modified = true;
        return `<Icons.${icon} className="${iconSize} ${className.replace(/text-\d+xl/, '').trim()}" />`;
      });
    }

    // Pattern 2: <div className="text-*">emoji</div>
    const divPattern = new RegExp(
      `<div className="([^"]*text-\\d+xl[^"]*)">\\s*${emoji}\\s*</div>`,
      'g'
    );
    
    if (divPattern.test(content)) {
      content = content.replace(divPattern, (match, className) => {
        const size = Object.keys(sizeMap).find(s => className.includes(s)) || 'text-4xl';
        const iconSize = sizeMap[size];
        needsIconImport = true;
        modified = true;
        return `<div className="${className.replace(/text-\d+xl/, '').trim()}"><Icons.${icon} className="${iconSize}" /></div>`;
      });
    }

    // Pattern 3: Simple emoji in JSX
    const simplePattern = new RegExp(`>\\s*${emoji}\\s*<`, 'g');
    if (simplePattern.test(content)) {
      content = content.replace(simplePattern, (match) => {
        needsIconImport = true;
        modified = true;
        return `><Icons.${icon} className="w-6 h-6" /><`;
      });
    }
  });

  // Add Icons import if needed and not present
  if (needsIconImport && !hasIconsImport && modified) {
    // Find the last import statement
    const importRegex = /import .+ from .+\n/g;
    const imports = content.match(importRegex);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      content = content.replace(
        lastImport,
        lastImport + "import Icons from '@/components/icons'\n"
      );
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  return false;
}

function processDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git
      if (!['node_modules', '.next', '.git', 'Docs'].includes(file)) {
        count += processDirectory(filePath, extensions);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      if (replaceEmojisInFile(filePath)) {
        count++;
      }
    }
  });

  return count;
}

// Run the script
console.log('🚀 Starting emoji replacement...\n');
const updatedFiles = processDirectory('./app');
const updatedComponents = processDirectory('./components');
console.log(`\n✨ Done! Updated ${updatedFiles + updatedComponents} files.`);
