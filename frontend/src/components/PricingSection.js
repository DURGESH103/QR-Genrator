import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      features: [
        '10 QR codes per month',
        'Basic customization',
        'PNG downloads',
        'Basic analytics',
        'Community support'
      ]
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        'Unlimited QR codes',
        'Advanced customization',
        'All download formats',
        'Detailed analytics',
        'Logo uploads',
        'Priority support',
        'API access'
      ]
    },
    {
      name: 'Enterprise',
      price: '$29',
      period: 'per month',
      icon: Rocket,
      color: 'from-orange-500 to-red-500',
      features: [
        'Everything in Pro',
        'White-label solution',
        'Custom domains',
        'Team collaboration',
        'Advanced security',
        'Dedicated support',
        'Custom integrations'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, transparent
            <span className="gradient-text block">pricing</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Start free and upgrade as you grow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className={`relative p-6 sm:p-8 rounded-2xl border-2 ${
                  plan.popular 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                } hover:shadow-xl transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                  Get Started
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;