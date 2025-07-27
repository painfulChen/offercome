// 简单的测试函数
exports.main = async (event, context) => {
    console.log('=== FUNCTION INVOKED ===');
    console.log('Event:', JSON.stringify(event));
    
    // 处理event可能为空的情况
    if (!event) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: '请求参数错误',
                error: 'Event object is undefined'
            })
        };
    }
    
    const { httpMethod, path } = event;
    
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
                method: httpMethod || 'unknown',
                path: path || 'unknown',
                timestamp: new Date().toISOString(),
                event: event
            }
        })
    };
}; 