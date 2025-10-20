import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FosterAnimals from './pages/FosterAnimals';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Donate from './pages/Donate';
import DonateSuccess from './pages/DonateSuccess';
import Animals from './pages/Animals';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Volunteer from './pages/Volunteer';
import Merch from './pages/Merch';

import Monthly from './pages/Monthly';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/animals" element={<Animals />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/donate/success" element={<DonateSuccess />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/stories/:id" element={<StoryDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="/merch" element={<Merch />} />
                {/* Paw Pack removed: route deprecated and removed. */}
                <Route path="/monthly" element={<Monthly />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/foster" element={<FosterAnimals />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;

