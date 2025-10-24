import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import QRGeneratorSection from '../components/QRGeneratorSection';
import PricingSection from '../components/PricingSection';
import DocsSection from '../components/DocsSection';
import Footer from '../components/Footer';

const ModernHomePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* QR Generator Section */}
      <QRGeneratorSection />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* Docs Section */}
      <DocsSection />
      
      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default ModernHomePage;