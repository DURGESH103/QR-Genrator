import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { qrAPI } from '../utils/api';
import QrPreview from '../components/QrPreview';
import { ChromePicker } from 'react-color';
import { 
  Link, 
  Type, 
  Wifi, 
  User, 
  FileText,
  Palette,
  Settings,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Zap
} from 'lucide-react';

const CreateQr = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'url');
  const [formData, setFormData] = useState({
    title: '',
    type: activeTab,
    content: {},
  });
  const [customization, setCustomization] = useState({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    size: 200,
    margin: 4,
  });
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState({ fg: false, bg: false });
  const [showPassword, setShowPassword] = useState(false);

  const qrTypes = [
    { id: 'url', name: 'URL', icon: Link, description: 'Website or link' },
    { id: 'text', name: 'Text', icon: Type, description: 'Plain text message' },
    { id: 'wifi', name: 'WiFi', icon: Wifi, description: 'WiFi credentials' },
    { id: 'vcard', name: 'vCard', icon: User, description: 'Contact information' },
    { id: 'file', name: 'File', icon: FileText, description: 'File or document' },
  ];

  useEffect(() => {
    setFormData(prev => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  useEffect(() => {
    if (hasRequiredContent()) {
      generatePreview();
    } else {
      setQrImage('');
    }
  }, [formData.content, customization, activeTab]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value }
    }));
  };

  const generatePreview = async () => {
    if (!hasRequiredContent()) return;

    try {
      const response = await qrAPI.preview({
        type: activeTab,
        content: formData.content,
        customization,
      });
      setQrImage(response.data.qrImage);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const hasRequiredContent = () => {
    switch (activeTab) {
      case 'url':
        return formData.content.url;
      case 'text':
        return formData.content.text;
      case 'wifi':
        return formData.content.ssid && formData.content.password;
      case 'vcard':
        return formData.content.name;
      case 'file':
        return formData.content.file;
      default:
        return false;
    }
  };

  const handleSave = async () => {
    if (!formData.title || !hasRequiredContent()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await qrAPI.generate({
        ...formData,
        customization,
      });
      toast.success('QR Code created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error creating QR code');
    } finally {
      setLoading(false);
    }
  };

  const renderContentForm = () => {
    switch (activeTab) {
      case 'url':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={formData.content.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Content *
              </label>
              <textarea
                rows={4}
                placeholder="Enter your text message..."
                value={formData.content.text || ''}
                onChange={(e) => handleInputChange('text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Network Name (SSID) *
              </label>
              <input
                type="text"
                placeholder="My WiFi Network"
                value={formData.content.ssid || ''}
                onChange={(e) => handleInputChange('ssid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="WiFi password"
                  value={formData.content.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Security Type
              </label>
              <select
                value={formData.content.security || 'WPA'}
                onChange={(e) => handleInputChange('security', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.content.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.content.organization || ''}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.content.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.content.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={formData.content.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Modern Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl mb-6">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
          Create Amazing QR Codes
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Design beautiful, customizable QR codes that stand out and drive engagement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* QR Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Choose QR Type
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {qrTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveTab(type.id)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      activeTab === type.id
                        ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${
                      activeTab === type.id 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className={`text-sm font-semibold mb-1 ${
                      activeTab === type.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'
                    }`}>
                      {type.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {type.description}
                    </div>
                    {activeTab === type.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Content Details
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  QR Code Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter a descriptive title for your QR code"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg"
                />
              </div>
              {renderContentForm()}
            </div>
          </div>

          {/* Customization */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Customization
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Foreground Color
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(prev => ({ ...prev, fg: !prev.fg }))}
                    className="w-full h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center px-4 space-x-3 hover:border-primary-400 transition-colors"
                    style={{ backgroundColor: customization.foregroundColor }}
                  >
                    <div className="w-6 h-6 rounded-lg border-2 border-white shadow-sm" style={{ backgroundColor: customization.foregroundColor }}></div>
                    <span className="text-white text-sm font-semibold drop-shadow-sm">
                      {customization.foregroundColor}
                    </span>
                  </button>
                  {showColorPicker.fg && (
                    <div className="absolute top-12 left-0 z-10">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowColorPicker(prev => ({ ...prev, fg: false }))}
                      />
                      <ChromePicker
                        color={customization.foregroundColor}
                        onChange={(color) => setCustomization(prev => ({ ...prev, foregroundColor: color.hex }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Background Color
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(prev => ({ ...prev, bg: !prev.bg }))}
                    className="w-full h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center px-4 space-x-3 hover:border-primary-400 transition-colors"
                    style={{ backgroundColor: customization.backgroundColor }}
                  >
                    <div className="w-6 h-6 rounded-lg border-2 border-gray-300 shadow-sm" style={{ backgroundColor: customization.backgroundColor }}></div>
                    <span className="text-gray-900 dark:text-white text-sm font-semibold">
                      {customization.backgroundColor}
                    </span>
                  </button>
                  {showColorPicker.bg && (
                    <div className="absolute top-12 left-0 z-10">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowColorPicker(prev => ({ ...prev, bg: false }))}
                      />
                      <ChromePicker
                        color={customization.backgroundColor}
                        onChange={(color) => setCustomization(prev => ({ ...prev, backgroundColor: color.hex }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Size: <span className="text-primary-600 font-bold">{customization.size}px</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={customization.size}
                  onChange={(e) => setCustomization(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Margin: <span className="text-primary-600 font-bold">{customization.margin}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={customization.margin}
                  onChange={(e) => setCustomization(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePreview}
              disabled={!hasRequiredContent()}
              className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 px-8 rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <Eye className="h-5 w-5" />
              <span>Generate Preview</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !formData.title || !hasRequiredContent()}
              className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-primary-400 disabled:to-primary-400 text-white py-4 px-8 rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Creating...' : 'Create QR Code'}</span>
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-4">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Live Preview
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your QR code will appear here
                </p>
              </div>
              
              <QrPreview 
                qrData={qrImage} 
                customization={customization}
                onDownload={() => toast.success('QR Code downloaded!')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQr;