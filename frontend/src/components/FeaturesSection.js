import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Palette, 
  BarChart3, 
  Layers, 
  Sparkles, 
  Shield,
  Globe,
  Download,
  Eye
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Dynamic QR Codes",
      description: "Create editable QR codes that can be updated without reprinting. Perfect for campaigns and marketing.",
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: Palette,
      title: "Custom Colors & Logos",
      description: "Personalize your QR codes with brand colors, logos, and custom designs. Make them uniquely yours.",
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: BarChart3,
      title: "Track Scans & Analytics",
      description: "Get detailed insights on scan locations, devices, time patterns, and user engagement metrics.",
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Layers,
      title: "Batch Generator",
      description: "Generate hundreds of QR codes at once with CSV import. Perfect for events and bulk operations.",
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Design",
      description: "Smart design suggestions based on your content type and brand guidelines. Let AI optimize your QR codes.",
      color: "from-indigo-400 to-purple-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Advanced security features including password protection, expiration dates, and access controls.",
      color: "from-red-400 to-pink-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm font-medium text-blue-800 dark:text-blue-200 mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Powerful Features
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4 sm:px-0">
            Everything you need to create
            <span className="gradient-text block">professional QR codes</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 sm:px-0">
            From simple URL codes to advanced analytics and custom branding, 
            our platform provides all the tools you need for successful QR code campaigns.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group relative"
              >
                <div className={`h-full p-6 sm:p-8 rounded-2xl ${feature.bgColor} border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl`}>
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover arrow */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-white">
                      Learn more
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: Eye, label: "Total Scans", value: "50M+" },
            { icon: Globe, label: "Countries", value: "150+" },
            { icon: Download, label: "Downloads", value: "2M+" },
            { icon: Shield, label: "Uptime", value: "99.9%" }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
              >
                <Icon className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;