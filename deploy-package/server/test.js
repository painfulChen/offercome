exports.main = async (event, context) => {
  console.log('Test function called');
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Test function works',
      path: event.path || 'unknown',
      method: event.httpMethod || 'unknown'
    })
  };
}; 