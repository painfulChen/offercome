// 本地开发服务器 - 支持热重载和实时预览
const express = require('express');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

// 静态文件服务
app.use(express.static('public'));
app.use(express.json());

// WebSocket服务器用于实时通信
const wss = new WebSocket.Server({ port: 3001 });

// 存储连接的客户端
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('🔄 客户端已连接');
  clients.add(ws);
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('🔌 客户端已断开');
  });
});

// 文件变化监听
const watcher = chokidar.watch(['public/**/*', 'server/**/*'], {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`📝 文件变化: ${filePath}`);
  
  // 通知所有连接的客户端
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'fileChanged',
        file: filePath,
        timestamp: Date.now()
      }));
    }
  });
});

// API代理 - 转发到CloudBase
app.use('/api', async (req, res) => {
  try {
    const cloudbaseUrl = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com';
    const response = await fetch(`${cloudbaseUrl}${req.url}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API代理错误:', error);
    res.status(500).json({ error: 'API调用失败' });
  }
});

// 开发工具页面
app.get('/dev', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OfferCome 开发工具</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .button { padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .button:hover { background: #0056b3; }
        .log { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; }
        .status { padding: 5px 10px; border-radius: 4px; margin: 5px; }
        .status.online { background: #28a745; color: white; }
        .status.offline { background: #dc3545; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 OfferCome 开发工具</h1>
        
        <div class="section">
          <h2>📊 开发状态</h2>
          <div id="status">
            <span class="status online">本地服务器运行中</span>
            <span class="status" id="wsStatus">WebSocket连接中...</span>
          </div>
        </div>
        
        <div class="section">
          <h2>🔗 快速链接</h2>
          <button class="button" onclick="window.open('http://localhost:3000', '_blank')">打开主页</button>
          <button class="button" onclick="window.open('http://localhost:3000/test-frontend.html', '_blank')">打开测试页</button>
          <button class="button" onclick="window.open('https://offercome2025-9g14jitp22f4ddfc-1256790827.tcloudbaseapp.com', '_blank')">生产环境</button>
        </div>
        
        <div class="section">
          <h2>🧪 API测试</h2>
          <button class="button" onclick="testAPI()">测试API连接</button>
          <button class="button" onclick="testAI()">测试AI服务</button>
          <div id="apiResult" class="log"></div>
        </div>
        
        <div class="section">
          <h2>📝 文件变化日志</h2>
          <div id="fileLog" class="log"></div>
        </div>
      </div>
      
      <script>
        const ws = new WebSocket('ws://localhost:3001');
        
        ws.onopen = () => {
          document.getElementById('wsStatus').textContent = 'WebSocket已连接';
          document.getElementById('wsStatus').className = 'status online';
        };
        
        ws.onclose = () => {
          document.getElementById('wsStatus').textContent = 'WebSocket已断开';
          document.getElementById('wsStatus').className = 'status offline';
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'fileChanged') {
            const log = document.getElementById('fileLog');
            log.innerHTML += \`<div>\${new Date().toLocaleTimeString()} - \${data.file}</div>\`;
            log.scrollTop = log.scrollHeight;
          }
        };
        
        async function testAPI() {
          const result = document.getElementById('apiResult');
          result.innerHTML = '测试中...';
          
          try {
            const response = await fetch('/api/health');
            const data = await response.json();
            result.innerHTML = JSON.stringify(data, null, 2);
          } catch (error) {
            result.innerHTML = 'API测试失败: ' + error.message;
          }
        }
        
        async function testAI() {
          const result = document.getElementById('apiResult');
          result.innerHTML = 'AI测试中...';
          
          try {
            const response = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: '你好，测试AI服务' })
            });
            const data = await response.json();
            result.innerHTML = JSON.stringify(data, null, 2);
          } catch (error) {
            result.innerHTML = 'AI测试失败: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`
🚀 OfferCome 开发服务器已启动！

📱 访问地址:
   - 主页: http://localhost:3000
   - 开发工具: http://localhost:3000/dev
   - 测试页面: http://localhost:3000/test-frontend.html

🔄 实时功能:
   - 文件变化自动检测
   - WebSocket实时通信
   - API代理到CloudBase

💡 开发提示:
   - 修改 public/ 下的文件会自动刷新
   - 修改 server/ 下的文件会重新部署
   - 使用开发工具页面监控状态
  `);
}); 