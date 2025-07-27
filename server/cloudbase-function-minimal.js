// 最简单的测试函数
exports.main = async (event, context) => {
    console.log('=== FUNCTION INVOKED ===');
    console.log('Event:', JSON.stringify(event));
    console.log('Context:', JSON.stringify(context));
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            success: true,
            message: '函数调用成功',
            data: {
                method: event.httpMethod,
                path: event.path,
                timestamp: new Date().toISOString()
            }
        })
    };
}; 