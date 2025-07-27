exports.main = function(event, context) {
    console.log('Function invoked');
    
    var response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            success: true,
            message: '测试成功',
            data: {
                method: event.httpMethod,
                path: event.path,
                timestamp: new Date().toISOString()
            }
        })
    };
    
    return response;
}; 