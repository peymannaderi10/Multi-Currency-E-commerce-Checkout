const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_KEY = process.env.API_KEY;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get latest exchange rates
app.get('/api/rates', async (req, res) => {
  try {
    const response = await fetch(
      `http://data.fixer.io/api/latest?access_key=${ACCESS_KEY}`
    );
    const data = await response.json();
    
    if (!data.success) {
      return res.status(400).json({ error: data.error?.info || 'Failed to fetch rates' });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error fetching currency data:', error);
    return res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// Endpoint to convert currency (could do this client-side too)
app.post('/api/convert', async (req, res) => {
  const { from, to, amount } = req.body;
  
  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const response = await fetch(
      `http://data.fixer.io/api/latest?access_key=${ACCESS_KEY}`
    );
    const data = await response.json();
    
    if (!data.success) {
      return res.status(400).json({ error: data.error?.info || 'Failed to fetch rates' });
    }
    
    // Calculate conversion (keeping in mind EUR is base for free plan)
    let convertedAmount;
    
    if (from === 'EUR') {
      convertedAmount = amount * data.rates[to];
    } else if (to === 'EUR') {
      convertedAmount = amount / data.rates[from];
    } else {
      const amountInEUR = amount / data.rates[from];
      convertedAmount = amountInEUR * data.rates[to];
    }
    
    return res.json({
      success: true,
      result: {
        from,
        to,
        amount: parseFloat(amount),
        convertedAmount: parseFloat(convertedAmount.toFixed(2)),
        rate: (data.rates[to] / (from === 'EUR' ? 1 : data.rates[from])).toFixed(6),
        date: data.date
      }
    });
    
  } catch (error) {
    console.error('Error converting currency:', error);
    return res.status(500).json({ error: 'Failed to convert currency' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});