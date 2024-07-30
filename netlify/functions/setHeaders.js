exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: { 'X-Content-Type-Options': 'nosniff' },
    body: JSON.stringify({ message: "Header set" })
  };
}
