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
  console.log('Location: certificates/');
  console.log('  - localhost-key.pem');
  console.log('  - localhost.pem\n');
  process.exit(0);
}

console.log('\n🔐 Generating SSL certificates for localhost...\n');

try {
  // Generate self-signed certificate using OpenSSL
  const command = `openssl req -x509 -out "${certPath}" -keyout "${keyPath}" -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -extensions EXT -config <(printf "[dn]\\nCN=localhost\\n[req]\\ndistinguished_name = dn\\n[EXT]\\nsubjectAltName=DNS:localhost\\nkeyUsage=digitalSignature\\nextendedKeyUsage=serverAuth")`;
  
  execSync(command, { 
    stdio: 'inherit',
    shell: '/bin/bash' // Required for process substitution
  });

  console.log('\n✅ SSL certificates generated successfully!\n');
  console.log('Location: certificates/');
  console.log('  - localhost-key.pem');
  console.log('  - localhost.pem\n');
  console.log('⚠️  Note: You may need to trust this certificate in your browser.\n');
  console.log('Now run: npm run dev\n');
} catch (error) {
  console.error('\n❌ Failed to generate certificates.');
  console.error('\nPlease ensure OpenSSL is installed on your system.');
  console.error('\nWindows: Download from https://slproweb.com/products/Win32OpenSSL.html');
  console.error('Mac: brew install openssl');
  console.error('Linux: sudo apt-get install openssl\n');
  process.exit(1);
}
