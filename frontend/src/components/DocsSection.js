import React from 'react';
import { motion } from 'framer-motion';
import { Book, Code, Zap, Shield, Globe, Headphones } from 'lucide-react';

const DocsSection = () => {
  const docCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of creating and customizing QR codes',
      color: 'from-blue-500 to-cyan-500',
      links: ['Quick Start Guide', 'Basic QR Types', 'Customization Options']
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Complete API documentation for developers',
      color: 'from-purple-500 to-pink-500',
      links: ['Authentication', 'Endpoints', 'Code Examples']
    },
    {
      icon: Zap,
      title: 'Advanced Features',
      description: 'Unlock the full potential of QR Generator Pro',
      color: 'from-green-500 to-emerald-500',
      links: ['Dynamic QR Codes', 'Analytics Setup', 'Batch Generation']
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Best practices for secure QR code implementation',
      color: 'from-red-500 to-orange-500',
      links: ['Security Guidelines', 'Data Protection', 'Access Control']
    },
    {
      icon: Globe,
      title: 'Integrations',
      description: 'Connect with your favorite tools and platforms',
      color: 'from-indigo-500 to-purple-500',
      links: ['Webhooks', 'Third-party Apps', 'Custom Solutions']
    },
    {
      icon: Headphones,
      title: 'Support',
      description: 'Get help when you need it most',
      color: 'from-yellow-500 to-orange-500',
      links: ['FAQ', 'Contact Support', 'Community Forum']
    }
  ];

  return (
    <section id="docs" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Documentation &
            <span className="gradient-text block">Resources</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to get started and make the most of QR Generator Pro.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {docCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${category.color} mb-6`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {category.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {category.description}
                </p>

                <ul className="space-y-2">
                  {category.links.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href="#"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-center text-white mx-4 sm:mx-0"
        >
          <h3 className="text-2xl font-bold mb-4">Need Help Getting Started?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our team is here to help you succeed. Get personalized onboarding and support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
              Schedule Demo
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DocsSection;