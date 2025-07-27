const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 代理云函数调用
app.post('/api/proxy', async (req, res) => {
    try {
        console.log('收到代理请求:', req.body);
        const { path, method = 'GET', body = null } = req.body;
        
        // 构建CLI命令
        const params = JSON.stringify({
            path: path,
            httpMethod: method,
            body: body
        });
        
        const command = `cloudbase functions:invoke api -e offercome2025-9g14jitp22f4ddfc --params '${params}'`;
        
        console.log('执行CLI命令:', command);
        
        // 执行CLI命令
        exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
            console.log('CLI执行结果 - stdout:', stdout);
            console.log('CLI执行结果 - stderr:', stderr);
            
            if (error) {
                console.error('CLI执行错误:', error);
                return res.status(500).json({
                    success: false,
                    error: error.message,
                    method: 'CLI-Proxy'
                });
            }
            
            if (stderr) {
                console.warn('CLI警告:', stderr);
            }
            
            try {
                // 解析CLI输出
                const lines = stdout.split('\n');
                let jsonResult = null;
                
                for (const line of lines) {
                    if (line.includes('返回结果：')) {
                        const jsonStr = line.replace('返回结果：', '').trim();
                        console.log('解析JSON字符串:', jsonStr);
                        jsonResult = JSON.parse(jsonStr);
                        break;
                    }
                }
                
                if (jsonResult) {
                    console.log('成功解析结果:', jsonResult);
                    
                    // 如果body字段是JSON字符串，需要解析它
                    if (jsonResult.body && typeof jsonResult.body === 'string') {
                        try {
                            const bodyData = JSON.parse(jsonResult.body);
                            res.json({
                                ...bodyData,
                                method: 'CLI-Proxy',
                                cliCommand: command
                            });
                        } catch (parseError) {
                            console.error('Body JSON解析失败:', parseError);
                            res.json({
                                success: false,
                                error: 'Body JSON解析失败',
                                rawBody: jsonResult.body,
                                method: 'CLI-Proxy'
                            });
                        }
                    } else {
                        res.json({
                            ...jsonResult,
                            method: 'CLI-Proxy',
                            cliCommand: command
                        });
                    }
                } else {
                    console.error('无法解析CLI输出，原始输出:', stdout);
                    res.json({
                        success: false,
                        error: '无法解析CLI输出',
                        rawOutput: stdout,
                        method: 'CLI-Proxy'
                    });
                }
            } catch (parseError) {
                console.error('JSON解析错误:', parseError);
                res.json({
                    success: false,
                    error: 'CLI输出解析失败',
                    rawOutput: stdout,
                    method: 'CLI-Proxy'
                });
            }
        });
        
    } catch (error) {
        console.error('代理调用错误:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            method: 'CLI-Proxy'
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: '代理服务器正常运行',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 代理服务器启动成功！`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🌐 前端页面: http://localhost:${PORT}/kimi-api-tester.html`);
    console.log(`📡 API代理: http://localhost:${PORT}/api/proxy`);
}); 