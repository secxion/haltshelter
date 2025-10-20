
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function MonthlyForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('25');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setLoading(false);
      return;
    }
    const cardElement = elements.getElement(CardElement);
    try {
      // 1. Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name, email }
      });
      if (pmError) throw new Error(pmError.message);
      // 2. Call backend to create subscription
      const res = await axios.post(
        (process.env.REACT_APP_API_URL || '/api') + '/donations/create-subscription',
        {
          name,
          email,
          amount: parseFloat(amount),
          paymentMethodId: paymentMethod.id
        }
      );
      const { clientSecret, paymentIntentStatus } = res.data;
      // 3. Only confirm payment if required
      if (paymentIntentStatus === 'succeeded') {
        setSuccess('Thank you! Your monthly donation is active.');
        setName(''); setEmail(''); setAmount('25');
        cardElement.clear();
      } else if (paymentIntentStatus === 'requires_action') {
        const { error: confError } = await stripe.confirmCardPayment(clientSecret);
        if (confError) throw new Error(confError.message);
        setSuccess('Thank you! Your monthly donation is active.');
        setName(''); setEmail(''); setAmount('25');
        cardElement.clear();
      } else {
        setError('Payment could not be completed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Start Your Monthly Gift</h2>
      <div className="mb-3">
        <label className="block font-medium mb-1">Name</label>
        <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="block font-medium mb-1">Email</label>
        <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="block font-medium mb-1">Monthly Amount (USD)</label>
        <input className="w-full border rounded px-3 py-2" type="number" min="5" step="1" value={amount} onChange={e => setAmount(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="block font-medium mb-1">Card Details</label>
        <div className="border rounded px-3 py-2 bg-gray-50">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded mt-2" disabled={loading || !stripe}>
        {loading ? 'Processing...' : 'Start Monthly Donation'}
      </button>
    </form>
  );
}

export default function Monthly() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
  <h1 className="text-3xl font-bold mb-4">Monthly Giving</h1>
  <p className="text-gray-600 mb-4">Join our monthly giving community to power sustained rescue operations. Monthly donors receive exclusive updates and early access to special items.</p>
      <Elements stripe={stripePromise}>
        <MonthlyForm />
      </Elements>
    </main>
  );
}
