const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, 'certificates');

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log('✅ Created certificates directory');
}

const keyPath = path.join(certDir, 'localhost-key.pem');
const certPath = path.join(certDir, 'localhost.pem');

// Check if certificates already exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('\n✅ SSL certificates already exist!\n');
  console.log('Location: certificates\\');
  console.log('  - localhost-key.pem');
  console.log('  - localhost.pem\n');
  process.exit(0);
}

console.log('\n🔐 Generating SSL certificates for localhost...\n');

try {
  // Generate private key
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
  
  // Generate certificate
  execSync(
    `openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/CN=localhost"`,
    { stdio: 'inherit' }
  );

  console.log('\n✅ SSL certificates generated successfully!\n');
  console.log('Location: certificates\\');
  console.log('  - localhost-key.pem');
  console.log('  - localhost.pem\n');
  console.log('⚠️  Note: You may need to trust this certificate in your browser.\n');
  console.log('Chrome: Type "thisisunsafe" on the warning page');
  console.log('Firefox: Click Advanced → Accept the Risk\n');
  console.log('Now run: npm run dev\n');
} catch (error) {
  console.error('\n❌ Failed to generate certificates.');
  console.error('\nPlease ensure OpenSSL is installed on your system.');
  console.error('\nWindows Options:');
  console.error('1. Install Git for Windows (includes OpenSSL): https://git-scm.com/download/win');
  console.error('2. Install OpenSSL: https://slproweb.com/products/Win32OpenSSL.html');
  console.error('3. Use Chocolatey: choco install openssl');
  console.error('\nAfter installation, restart your terminal and try again.\n');
  process.exit(1);
}
