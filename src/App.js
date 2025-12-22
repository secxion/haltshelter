import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FosterAnimals from './pages/FosterAnimals';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ScrollToTop from './components/ScrollToTop';
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
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

import Monthly from './pages/Monthly';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden max-w-full">
            <Navbar />
            {/* Main content area - no pt-16 needed since sticky nav doesn't take space from flow */}
            <main className="flex-grow w-full max-w-full overflow-x-hidden">
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
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
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

