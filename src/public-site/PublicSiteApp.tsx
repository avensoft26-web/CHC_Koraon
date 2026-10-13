import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import Facilities from './pages/Facilities';
import Gallery from './pages/Gallery';
import Appointment from './pages/Appointment';
import Contact from './pages/Contact';

import './public-site.css';

export function PublicSiteApp() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Navigate to="/" replace />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/facilities" element={<Navigate to="/" replace />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default PublicSiteApp;
