import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './PawPack.css';

const PawPackLanding = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiService.newsletter.subscribe(email);
      navigate('/monthly');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to subscribe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pawpack-landing">
    <h1>Welcome to the Paw Pack!</h1>
    <p className="subtitle">Celebrating our Monthly Supporters</p>
    <section className="impact">
      <h2>Why Join the Paw Pack?</h2>
      <ul>
        <li>Make a lasting difference for animals in need</li>
        <li>Get exclusive updates and behind-the-scenes stories</li>
        <li>Be recognized as a valued member of our community</li>
      </ul>
    </section>
    <section className="testimonials">
      <h2>Member Testimonials</h2>
      <div className="testimonial">
        <img src="/images/animals/pawpack1.jpg" alt="Happy supporter" />
        <blockquote>“Being a Paw Pack member makes me feel truly connected to the animals I help!”</blockquote>
        <cite>- Alex, monthly donor</cite>
      </div>
      <div className="testimonial">
        <img src="/images/animals/pawpack2.jpg" alt="Supporter with rescue dog" />
        <blockquote>“The monthly stories and photos are the highlight of my inbox.”</blockquote>
        <cite>- Jamie, Paw Pack member</cite>
      </div>
    </section>
    <section className="signup">
      <h2>Join the Paw Pack Community</h2>
      <p>Sign up for our exclusive monthly donor newsletter and get access to special content, updates, and more!</p>
      <form className="pawpack-newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </section>
    <section className="exclusive-content">
      <h2>Exclusive for Paw Pack Members</h2>
      <ul>
        <li>Monthly behind-the-scenes stories</li>
        <li>Special photos and videos</li>
        <li>Invitations to virtual events</li>
      </ul>
    </section>
  </div>

  );
};

export default PawPackLanding;
