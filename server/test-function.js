exports.main = async (event, context) => {
  console.log('测试函数被调用');
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Hello from CloudBase Function!',
      timestamp: new Date().toISOString(),
      event: event
    })
  };
}; 