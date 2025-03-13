// Sample product data - in a real app, this would come from a database
const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      description: "Noise-cancelling with 20hr battery life",
      image: "headphone-159569_640.png",
      price: 199.99, // Base price in USD
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      description: "Track your health with precision",
      image: "watch-42803_640.png",
      price: 149.50, // Base price in USD
    },
    {
      id: 3,
      name: "Ultralight Gaming Desktop",
      description: "Powerful computing on the go",
      image: "computer-158743_640.png",
      price: 1299.00, // Base price in USD
    },
    {
      id: 4,
      name: "Wireless Charging Pad",
      description: "Fast charging for all your devices",
      image: "charge-159707_640.png",
      price: 49.99, // Base price in USD
    }
  ];
  
  // Shopping cart - for this demo, we'll add all products to cart
  const cart = products.map(product => ({
    ...product,
    quantity: 1
  }));
  
  // Default currency is USD
  let currentCurrency = 'USD';
  let exchangeRates = {};
  let baseCurrency = 'EUR'; // Fixer free API uses EUR as base
  
  // Shipping and tax rates (in USD)
  const shippingRate = 10.00;
  const taxRate = 0.08; // 8%
  
  // Format currency based on locale
  function formatCurrency(amount, currency) {
    const currencySymbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
      'CAD': 'C$', 'AUD': 'A$', 'CNY': '¥', 'CHF': 'Fr'
    };
    
    // For JPY, don't show decimal places
    if (currency === 'JPY') {
      return `${currencySymbols[currency]}${Math.round(amount)}`;
    }
    
    return `${currencySymbols[currency]}${amount.toFixed(2)}`;
  }
  
  // Convert amount from USD to target currency
  function convertAmount(amount, fromCurrency, toCurrency) {
    if (!exchangeRates || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return amount; // Return original if we can't convert
    }
    
    // Convert from source to EUR (base currency), then to target
    if (fromCurrency === baseCurrency) {
      return amount * exchangeRates[toCurrency];
    } else if (toCurrency === baseCurrency) {
      return amount / exchangeRates[fromCurrency];
    } else {
      const amountInEUR = amount / exchangeRates[fromCurrency];
      return amountInEUR * exchangeRates[toCurrency];
    }
  }
  
  // Fetch exchange rates from our backend
  async function fetchExchangeRates() {
    try {
      const response = await fetch('/api/rates');
      const data = await response.json();
      
      if (data.success) {
        exchangeRates = data.rates;
        baseCurrency = data.base; // Usually 'EUR' for free plan
        
        // Add the base currency rate (1.0)
        exchangeRates[baseCurrency] = 1.0;
        
        // Update UI with new rates
        updatePricesDisplay();
        
        // Update exchange rate info
        const baseRate = exchangeRates[currentCurrency];
        const date = new Date(data.date).toLocaleDateString();
        document.getElementById('exchange-rate-info').textContent = 
          `Exchange rate: 1 ${baseCurrency} = ${baseRate.toFixed(6)} ${currentCurrency} (${date})`;
      } else {
        console.error('Failed to get exchange rates:', data.error);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  }
  
  // Render products to the page
  function renderProducts() {
    const productList = document.getElementById('product-list');
    
    cart.forEach(product => {
      const productElement = document.createElement('div');
      productElement.className = 'col-md-6 mb-3';
      productElement.innerHTML = `
        <div class="card product-card">
          <img src="${product.image}" class="card-img-top" alt="${product.name}">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.description}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="price-tag" data-product-id="${product.id}" data-base-price="${product.price}">
                $${product.price.toFixed(2)}
              </span>
              <div class="input-group" style="width: 120px;">
                <span class="input-group-text">Qty</span>
                <input type="number" class="form-control quantity-input" 
                       data-product-id="${product.id}" value="${product.quantity}" min="1">
              </div>
            </div>
          </div>
        </div>
      `;
      productList.appendChild(productElement);
    });
    
    // Add event listeners to quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const productId = parseInt(e.target.dataset.productId);
        const newQuantity = parseInt(e.target.value);
        
        if (newQuantity < 1) {
          e.target.value = 1;
          return;
        }
        
        // Update cart quantity
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
          cartItem.quantity = newQuantity;
          updatePricesDisplay();
        }
      });
    });
  }
  
  // Update all prices when currency changes
  function updatePricesDisplay() {
    // Update product prices
    document.querySelectorAll('.price-tag').forEach(priceElement => {
      const productId = parseInt(priceElement.dataset.productId);
      const basePrice = parseFloat(priceElement.dataset.basePrice);
      const product = cart.find(item => item.id === productId);
      
      if (product) {
        const convertedPrice = convertAmount(basePrice, 'USD', currentCurrency);
        priceElement.textContent = formatCurrency(convertedPrice, currentCurrency);
      }
    });
    
    // Calculate and update cart totals
    updateCartTotals();
  }
  
  // Calculate and display cart totals
  function updateCartTotals() {
    let subtotal = 0;
    
    // Calculate subtotal
    cart.forEach(item => {
      const itemPrice = convertAmount(item.price, 'USD', currentCurrency);
      subtotal += itemPrice * item.quantity;
    });
    
    // Calculate shipping and tax
    const shipping = convertAmount(shippingRate, 'USD', currentCurrency);
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;
    
    // Update the display
    document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal, currentCurrency);
    document.getElementById('cart-shipping').textContent = formatCurrency(shipping, currentCurrency);
    document.getElementById('cart-tax').textContent = formatCurrency(tax, currentCurrency);
    document.getElementById('cart-total').textContent = formatCurrency(total, currentCurrency);
  }
  
  // Initialize the app
  document.addEventListener('DOMContentLoaded', () => {
    // Render the product list
    renderProducts();
    
    // Fetch exchange rates
    fetchExchangeRates();
    
    // Set up currency selector
    const currencySelector = document.getElementById('currency-selector');
    currencySelector.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      updatePricesDisplay();
    });
  });