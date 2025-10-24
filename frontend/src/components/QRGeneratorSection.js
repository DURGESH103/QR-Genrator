import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { ChromePicker } from 'react-color';
import QRCode from 'qrcode';
import { 
  Link, 
  Type, 
  Wifi, 
  Mail, 
  MessageSquare,
  Download,
  Copy,
  Palette,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';

const QRGeneratorSection = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [qrOptions, setQrOptions] = useState({
    foreground: '#000000',
    background: '#FFFFFF',
    size: 256,
    margin: 4,
    errorCorrectionLevel: 'M'
  });
  const [showColorPicker, setShowColorPicker] = useState({ fg: false, bg: false });
  const [formData, setFormData] = useState({
    url: 'https://example.com',
    text: 'Hello World!',
    wifi: { ssid: '', password: '', security: 'WPA' },
    email: { email: '', subject: '', body: '' },
    sms: { phone: '', message: '' }
  });
  const [logo, setLogo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const qrTypes = [
    { id: 'url', name: 'Website URL', icon: Link, placeholder: 'https://example.com' },
    { id: 'text', name: 'Plain Text', icon: Type, placeholder: 'Enter your text...' },
    { id: 'wifi', name: 'WiFi Network', icon: Wifi, placeholder: 'Network credentials' },
    { id: 'email', name: 'Email', icon: Mail, placeholder: 'Email details' },
    { id: 'sms', name: 'SMS Message', icon: MessageSquare, placeholder: 'Phone & message' }
  ];

  useEffect(() => {
    generateQR();
  }, [activeTab, formData, qrOptions]);

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      let content = '';
      
      switch (activeTab) {
        case 'url':
          content = formData.url;
          break;
        case 'text':
          content = formData.text;
          break;
        case 'wifi':
          content = `WIFI:T:${formData.wifi.security};S:${formData.wifi.ssid};P:${formData.wifi.password};;`;
          break;
        case 'email':
          content = `mailto:${formData.email.email}?subject=${formData.email.subject}&body=${formData.email.body}`;
          break;
        case 'sms':
          content = `sms:${formData.sms.phone}?body=${formData.sms.message}`;
          break;
        default:
          content = formData.url;
      }

      const qr = await QRCode.toDataURL(content, {
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: {
          dark: qrOptions.foreground,
          light: qrOptions.background
        },
        errorCorrectionLevel: qrOptions.errorCorrectionLevel
      });
      
      setQrData(qr);
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error('Error generating QR code');
    }
    setIsGenerating(false);
  };

  const handleInputChange = (field, value) => {
    if (activeTab === 'wifi' || activeTab === 'email' || activeTab === 'sms') {
      setFormData(prev => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [activeTab]: value }));
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrData;
    link.click();
    toast.success('QR code downloaded!');
  };

  const copyToClipboard = async () => {
    try {
      const response = await fetch(qrData);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      toast.success('QR code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy QR code');
    }
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const renderForm = () => {
    switch (activeTab) {
      case 'url':
        return (
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
          />
        );
      
      case 'text':
        return (
          <textarea
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="Enter your text message..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring resize-none"
          />
        );
      
      case 'wifi':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={formData.wifi.ssid}
              onChange={(e) => handleInputChange('ssid', e.target.value)}
              placeholder="Network Name (SSID)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.wifi.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <select
              value={formData.wifi.security}
              onChange={(e) => handleInputChange('security', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
        );
      
      case 'email':
        return (
          <div className="space-y-4">
            <input
              type="email"
              value={formData.email.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
            />
            <input
              type="text"
              value={formData.email.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Email Subject"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
            />
            <textarea
              value={formData.email.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="Email message..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring resize-none"
            />
          </div>
        );
      
      case 'sms':
        return (
          <div className="space-y-4">
            <input
              type="tel"
              value={formData.sms.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1234567890"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring"
            />
            <textarea
              value={formData.sms.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="SMS message..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-ring resize-none"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Create Your
            <span className="gradient-text block">Perfect QR Code</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose your content type, customize the design, and generate professional QR codes in seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Generator Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* QR Type Tabs */}
            <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
                {qrTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveTab(type.id)}
                      className={`p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                        activeTab === type.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2" />
                      <div className="text-xs font-medium hidden sm:block">{type.name}</div>
                      <div className="text-xs font-medium sm:hidden">{type.name.split(' ')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Form */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {qrTypes.find(t => t.id === activeTab)?.name} Details
              </h3>
              {renderForm()}
            </div>

            {/* Customization Options */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Customize Design
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Foreground Color
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(prev => ({ ...prev, fg: !prev.fg }))}
                      className="w-full h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center px-4 space-x-3"
                      style={{ backgroundColor: qrOptions.foreground }}
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: qrOptions.foreground }}></div>
                      <span className="text-white font-medium">{qrOptions.foreground}</span>
                    </button>
                    {showColorPicker.fg && (
                      <div className="absolute top-14 left-0 z-20">
                        <div
                          className="fixed inset-0"
                          onClick={() => setShowColorPicker(prev => ({ ...prev, fg: false }))}
                        />
                        <ChromePicker
                          color={qrOptions.foreground}
                          onChange={(color) => setQrOptions(prev => ({ ...prev, foreground: color.hex }))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Background Color
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(prev => ({ ...prev, bg: !prev.bg }))}
                      className="w-full h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center px-4 space-x-3"
                      style={{ backgroundColor: qrOptions.background }}
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm" style={{ backgroundColor: qrOptions.background }}></div>
                      <span className="text-gray-900 font-medium">{qrOptions.background}</span>
                    </button>
                    {showColorPicker.bg && (
                      <div className="absolute top-14 left-0 z-20">
                        <div
                          className="fixed inset-0"
                          onClick={() => setShowColorPicker(prev => ({ ...prev, bg: false }))}
                        />
                        <ChromePicker
                          color={qrOptions.background}
                          onChange={(color) => setQrOptions(prev => ({ ...prev, background: color.hex }))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Size: {qrOptions.size}px
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    value={qrOptions.size}
                    onChange={(e) => setQrOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>

                {/* Margin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Margin: {qrOptions.margin}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={qrOptions.margin}
                    onChange={(e) => setQrOptions(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Add Logo (Optional)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDragActive ? 'Drop the logo here...' : 'Drag & drop a logo, or click to select'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* QR Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Live Preview
              </h3>
              
              <div className="qr-container p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 mb-6">
                {isGenerating ? (
                  <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-gray-200 dark:bg-gray-600 rounded-lg shimmer"></div>
                ) : qrData ? (
                  <motion.img
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    src={qrData}
                    alt="Generated QR Code"
                    className="w-48 h-48 sm:w-64 sm:h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Settings className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={downloadQR}
                  disabled={!qrData || isGenerating}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PNG
                </button>
                
                <button
                  onClick={copyToClipboard}
                  disabled={!qrData || isGenerating}
                  className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default QRGeneratorSection;