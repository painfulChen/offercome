module.exports.main = function(event, context) {
  console.log('Function called');
  
  var response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      message: 'Hello from CloudBase',
      timestamp: new Date().toISOString()
    })
  };
  
  return response;
}; 