import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with error handling
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);

// Stripe service for handling payments
export const stripeService = {
  // Get Stripe instance
  getStripe: async () => {
    if (!stripePublishableKey) {
      throw new Error('Stripe is not configured. Please check your environment variables.');
    }
    return await stripePromise;
  },

  // Create payment intent for one-time donations
  createPaymentIntent: async (amount, currency = 'usd', metadata = {}) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/donations/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Process payment with Stripe Elements
  processPayment: async (stripe, elements, clientSecret, billingDetails = {}) => {
    if (!stripe || !elements) {
      throw new Error('Stripe has not loaded yet');
    }

    const cardElement = elements.getElement('card');
    if (!cardElement) {
      throw new Error('Card element not found');
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      },
    });

    return result;
  },

  // Create subscription for monthly donations
  createSubscription: async (customerId, priceId, paymentMethodId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/donations/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          price_id: priceId,
          payment_method_id: paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Create customer
  createCustomer: async (email, name, metadata = {}) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/donations/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Format amount for display
  formatAmount: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Validate amount
  validateAmount: (amount, minAmount = 1, maxAmount = 10000) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      return { valid: false, error: 'Please enter a valid amount' };
    }
    
    if (numAmount < minAmount) {
      return { valid: false, error: `Minimum donation is ${stripeService.formatAmount(minAmount)}` };
    }
    
    if (numAmount > maxAmount) {
      return { valid: false, error: `Maximum donation is ${stripeService.formatAmount(maxAmount)}` };
    }
    
    return { valid: true, error: null };
  },

  // Get predefined donation amounts
  getPredefinedAmounts: (isEmergency = false) => {
    if (isEmergency) {
      return [
        { amount: 50, impact: 'Emergency medication for 1 animal' },
        { amount: 150, impact: 'Emergency surgery supplies' },
        { amount: 300, impact: 'Complete emergency veterinary care' },
        { amount: 750, impact: 'Multiple animal emergency response' },
        { amount: 1500, impact: 'Mobile emergency unit deployment' }
      ];
    }
    
    return [
      { amount: 25, impact: 'Feeds 5 animals for a day' },
      { amount: 50, impact: 'Provides basic veterinary care' },
      { amount: 100, impact: 'Sponsors an animal\'s shelter stay' },
      { amount: 250, impact: 'Covers emergency medical treatment' },
      { amount: 500, impact: 'Funds a complete rescue operation' },
      { amount: 1000, impact: 'Supports shelter operations for a week' }
    ];
  },
};

export default stripeService;
