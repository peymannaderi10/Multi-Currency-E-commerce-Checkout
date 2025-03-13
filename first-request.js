// You'll need node-fetch for Node.js versions before 18
// If you're on Node.js 18+, you can use the native fetch API instead
const fetch = require('node-fetch');

// Replace this with your actual API key from Fixer
const accessKey = '666c05b3c8767fc7b09a6811e5b86135';

// Make the API request for latest rates
fetch(`http://data.fixer.io/api/latest?access_key=${accessKey}`)
  .then(response => response.json())
  .then(data => {
    // Print the JSON
    console.log('Exchange rate data:');
    console.log(JSON.stringify(data, null, 2));
    
    // If successful, let's check some specific currencies
    if (data.success) {
      console.log('\nExchange rates against 1 EUR:');
      console.log(`USD: ${data.rates.USD}`);
      console.log(`GBP: ${data.rates.GBP}`);
      console.log(`JPY: ${data.rates.JPY}`);
    }
  })
  .catch(error => console.error('Error:', error));