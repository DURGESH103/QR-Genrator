import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Download, Palette } from 'lucide-react';
import QRCode from 'qrcode';

const HeroSection = () => {
  const [qrCode, setQrCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateSampleQR();
  }, []);

  const generateSampleQR = async () => {
    setIsGenerating(true);
    try {
      const qr = await QRCode.toDataURL('https://qrgenerator.pro', {
        width: 200,
        margin: 2,
        color: {
          dark: '#3B82F6',
          light: '#FFFFFF'
        }
      });
      setQrCode(qr);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
    setIsGenerating(false);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '-2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '-4s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm font-medium text-blue-800 dark:text-blue-200 mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered QR Generation
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight"
            >
              Generate
              <span className="gradient-text block">Beautiful QR Codes</span>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">Instantly</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl px-4 sm:px-0"
            >
              Create stunning, customizable QR codes with advanced analytics, 
              dynamic content, and professional design options. Perfect for businesses and creators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0"
            >
              <button className="btn-primary group">
                <span>Generate QR Code</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="btn-secondary group">
                <Palette className="w-5 h-5 mr-2" />
                <span>Customize Design</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 mt-8 sm:mt-12 px-4 sm:px-0"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">10M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">QR Codes Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - QR Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse-slow"></div>
              
              {/* QR Container */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl hover-lift"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Live Preview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan to visit our website
                  </p>
                </div>

                <div className="qr-container p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
                  {isGenerating ? (
                    <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-200 dark:bg-gray-600 rounded-lg shimmer mx-auto"></div>
                  ) : (
                    <motion.img
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                      src={qrCode}
                      alt="Sample QR Code"
                      className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-lg"
                    />
                  )}
                </div>

                <div className="flex justify-center gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <Palette className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;