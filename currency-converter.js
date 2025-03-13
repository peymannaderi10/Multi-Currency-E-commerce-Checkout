const fetch = require('node-fetch'); // If you're using Node.js < 18

const accessKey = process.env.API_KEY;

// Our Fixer API call
async function convertCurrency(from, to, amount) {
  try {
    // First, get the latest exchange rates
    const response = await fetch(
      `http://data.fixer.io/api/latest?access_key=${accessKey}`
    );
    const data = await response.json();
    
    if (!data.success) {
      console.error('Error:', data.error ? data.error.info : 'Unknown error');
      return;
    }
    
    // Check if both currencies are supported
    if (!data.rates[from] && from !== data.base) {
      console.error(`Currency not supported: ${from}`);
      return;
    }
    
    if (!data.rates[to] && to !== data.base) {
      console.error(`Currency not supported: ${to}`);
      return;
    }
    
    // Calculate the conversion
    // Note: Fixer free plan uses EUR as base, so we need to convert everything to EUR first
    let result;
    
    if (from === 'EUR') {
      // Direct conversion from EUR to target
      result = amount * data.rates[to];
    } else if (to === 'EUR') {
      // Direct conversion from source to EUR
      result = amount / data.rates[from];
    } else {
      // Convert from source to EUR, then from EUR to target
      const amountInEUR = amount / data.rates[from];
      result = amountInEUR * data.rates[to];
    }
    
    // Let's format this nicely for the console
    console.log('\n💰 CURRENCY CONVERSION RESULT 💰\n');
    console.log(`${amount} ${from} = ${result.toFixed(2)} ${to}`);
    console.log(`Exchange rate: 1 ${from} = ${(data.rates[to] / data.rates[from]).toFixed(6)} ${to}`);
    console.log(`Date: ${data.date}\n`);

    
  } catch (error) {
    console.error('Failed to fetch currency data:', error);
  }
}

// Process command line arguments
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.log('Usage: node currency-converter.js FROM_CURRENCY TO_CURRENCY AMOUNT');
  console.log('Example: node currency-converter.js USD EUR 100');
} else {
  const [from, to, amount] = args;
  convertCurrency(from.toUpperCase(), to.toUpperCase(), parseFloat(amount));
}