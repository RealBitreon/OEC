const forge = require('node-forge');
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
  // Generate a key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);

  // Create a certificate
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }]
  }]);

  // Self-sign certificate
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // Convert to PEM format
  const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
  const pemCert = forge.pki.certificateToPem(cert);

  // Write to files
  fs.writeFileSync(keyPath, pemKey);
  fs.writeFileSync(certPath, pemCert);

  console.log('✅ SSL certificates generated successfully!\n');
  console.log('Location: certificates\\');
  console.log('  - localhost-key.pem');
  console.log('  - localhost.pem\n');
  console.log('⚠️  Note: You may need to trust this certificate in your browser.\n');
  console.log('Chrome: Type "thisisunsafe" on the warning page');
  console.log('Firefox: Click Advanced → Accept the Risk\n');
  console.log('Now run: npm run dev\n');
} catch (error) {
  console.error('\n❌ Failed to generate certificates.');
  console.error('Error:', error.message);
  console.error('\nPlease run: npm install node-forge\n');
  process.exit(1);
}
