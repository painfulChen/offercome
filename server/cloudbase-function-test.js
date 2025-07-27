// 最简单的测试版本
exports.main_handler = async (event, context) => {
    console.log('Function invoked with event:', JSON.stringify(event));
    
    try {
        const { httpMethod, path } = event;
        
        console.log('HTTP Method:', httpMethod);
        console.log('Path:', path);
        
        // 返回简单的成功响应
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: '测试成功',
                data: {
                    method: httpMethod,
                    path: path,
                    timestamp: new Date().toISOString(),
                    event: event
                }
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
            })
        };
    }
}; 