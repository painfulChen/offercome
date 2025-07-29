console.log('🧪 验证OfferCome系统API');
console.log('======================');

const https = require('https');

const BASE_URL = 'https://offercome2025-9g14jitp22f4ddfc-1256790827.ap-shanghai.app.tcloudbase.com/api-v2';

const apis = [
    '/health',
    '/mbti/questions',
    '/ai/chat',
    '/rag/documents',
    '/auth/register',
    '/cases',
    '/sms/send',
    '/admin/stats'
];

let completed = 0;

apis.forEach(api => {
    const req = https.request(BASE_URL + api, (res) => {
        console.log(`${api}: ${res.statusCode}`);
        res.on('data', () => {});
        res.on('end', () => {
            completed++;
            if (completed === apis.length) {
                console.log('\n✅ 所有API测试完成');
            }
        });
    });
    req.end();
}); 