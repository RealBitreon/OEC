const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Check if certificates exist
  const certDir = path.join(__dirname, 'certificates');
  const keyPath = path.join(certDir, 'localhost-key.pem');
  const certPath = path.join(certDir, 'localhost.pem');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('\n❌ SSL certificates not found!');
    console.error('\nPlease run: npm run generate-cert\n');
    process.exit(1);
  }

  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('خطأ في معالجة الطلب:', req.url, err);
      res.statusCode = 500;
      
      // Send HTML error page instead of plain text
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>خطأ في الخادم</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      padding: 40px;
      max-width: 500px;
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #fee;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      color: #dc2626;
    }
    h1 {
      font-size: 72px;
      color: #dc2626;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 24px;
      color: #1f2937;
      margin-bottom: 10px;
    }
    p {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }
    .primary {
      background: #10b981;
      color: white;
    }
    .primary:hover {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    .secondary {
      background: #f3f4f6;
      color: #374151;
    }
    .secondary:hover {
      background: #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h1>500</h1>
    <h2>خطأ في الخادم</h2>
    <p>عذراً، حدث خطأ في الخادم. نحن نعمل على إصلاحه. يرجى المحاولة مرة أخرى لاحقاً.</p>
    <div class="buttons">
      <button class="primary" onclick="window.location.reload()">إعادة تحميل الصفحة</button>
      <button class="secondary" onclick="window.location.href='/'">العودة للصفحة الرئيسية</button>
    </div>
  </div>
</body>
</html>
      `);
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, '0.0.0.0', () => {
      console.log(`\n✅ Server ready on:\n`);
      console.log(`   🔒 https://localhost:${port}`);
      console.log(`   🌐 https://192.168.1.113:${port}`);
      console.log(`\n   Access from any device on your network!\n`);
    });
});
