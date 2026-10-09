import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { qrAPI } from '../utils/api';
import { composeQrWithLogo, fileToResizedDataUrl } from '../utils/qrImage';
import QrPreview from '../components/QrPreview';
import FileUpload from '../components/FileUpload';
import EmojiPicker from '../components/EmojiPicker';
import { ChromePicker } from 'react-color';
import {
  Link,
  Type,
  Wifi,
  User,
  FileText,
  Image as ImageIcon,
  Smile,
  Palette,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Layers,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy,
  RotateCcw
} from 'lucide-react';

const QR_TYPES = [
  { id: 'url', name: 'URL', icon: Link, description: 'Website or link' },
  { id: 'text', name: 'Text', icon: Type, description: 'Plain text message' },
  { id: 'wifi', name: 'WiFi', icon: Wifi, description: 'WiFi credentials' },
  { id: 'vcard', name: 'vCard', icon: User, description: 'Contact information' },
  { id: 'file', name: 'File', icon: FileText, description: 'Link to a file' },
  { id: 'image', name: 'Image', icon: ImageIcon, description: 'Share a photo' },
  { id: 'emoji', name: 'Emoji', icon: Smile, description: 'Emoji message page' },
];

// These types encode a link to a hosted /view/:id page, so the final code only exists after saving
const VIEWER_TYPES = ['image', 'emoji'];

const INITIAL_CUSTOMIZATION = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  size: 200,
  margin: 4,
  errorCorrectionLevel: 'H',
  logo: '',
  logoSize: 0.22,
  logoBackground: true,
};

const EMOJI_BACKGROUNDS = ['#ffffff', '#fef3c7', '#fce7f3', '#dbeafe', '#dcfce7', '#ede9fe', '#111827'];

const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

const initialContent = (type) => (
  type === 'emoji'
    ? { emojis: [], title: '', message: '', style: { background: '#ffffff', size: 'md' } }
    : {}
);

const hasRequiredContent = (type, c) => {
  switch (type) {
    case 'url': return !!c.url;
    case 'text': return !!c.text;
    case 'wifi': return !!(c.ssid && (c.password || c.security === 'nopass'));
    case 'vcard': return !!c.name;
    case 'file': return !!c.url;
    case 'image': return !!c.imageId;
    case 'emoji': return Array.isArray(c.emojis) && c.emojis.length > 0;
    default: return false;
  }
};

const CreateQr = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestedType = searchParams.get('type');
  const [activeTab, setActiveTab] = useState(QR_TYPES.some(t => t.id === requestedType) ? requestedType : 'url');
  const [formData, setFormData] = useState({ title: '', type: activeTab, content: initialContent(activeTab) });
  const [customization, setCustomization] = useState(INITIAL_CUSTOMIZATION);
  const [qrImage, setQrImage] = useState('');
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState({ fg: false, bg: false });
  const [showPassword, setShowPassword] = useState(false);
  // Result of saving an Emoji/Image QR: { qrImage, viewerUrl }
  const [saved, setSaved] = useState(null);

  // Image QR state; imagePreview is a local blob URL used only for display before/while uploading
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | uploaded | error
  const [uploadError, setUploadError] = useState('');
  const uploadSeq = useRef(0);
  const previewSeq = useRef(0);

  // Logo state (the logo data URL itself lives in customization.logo)
  const [logoFile, setLogoFile] = useState(null);

  const clearImage = useCallback(() => {
    uploadSeq.current += 1;
    setImageFile(null);
    setImagePreview('');
    setUploadStatus('idle');
    setUploadError('');
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, type: activeTab, content: initialContent(activeTab) }));
    setQrImage('');
    clearImage();
  }, [activeTab, clearImage]);

  // Revoke the local preview blob URL when it is replaced or on unmount
  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const isViewerType = VIEWER_TYPES.includes(activeTab);
  const contentReady = hasRequiredContent(activeTab, formData.content);
  const contentKey = JSON.stringify(formData.content);
  // Viewer-type previews only encode a placeholder URL, so their content doesn't affect the QR pattern
  const previewKey = isViewerType ? '' : contentKey;
  const { foregroundColor, backgroundColor, size, margin, errorCorrectionLevel } = customization;

  const generatePreview = useCallback(async () => {
    const seq = ++previewSeq.current;
    try {
      const response = await qrAPI.preview({
        type: activeTab,
        content: previewKey ? JSON.parse(previewKey) : {},
        customization: { foregroundColor, backgroundColor, size, margin, errorCorrectionLevel },
      });
      if (seq !== previewSeq.current) return;
      setQrImage(response.data.qrImage);
      setIsPlaceholder(!!response.data.isPlaceholder);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  }, [activeTab, previewKey, foregroundColor, backgroundColor, size, margin, errorCorrectionLevel]);

  useEffect(() => {
    if (!contentReady) {
      previewSeq.current += 1;
      setQrImage('');
      return undefined;
    }
    const timer = setTimeout(generatePreview, 400);
    return () => clearTimeout(timer);
  }, [contentReady, generatePreview]);

  // Any edit after saving invalidates the saved result shown in the preview
  useEffect(() => {
    setSaved(null);
  }, [activeTab, contentKey, formData.title, foregroundColor, backgroundColor, size, margin, errorCorrectionLevel,
      customization.logo, customization.logoSize, customization.logoBackground]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value }
    }));
  };

  // Emoji QR
  const toggleEmoji = (emoji) => {
    setFormData(prev => {
      const emojis = prev.content.emojis || [];
      const next = emojis.includes(emoji) ? emojis.filter(e => e !== emoji) : [...emojis, emoji];
      return { ...prev, content: { ...prev.content, emojis: next } };
    });
  };

  const handleEmojiStyle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, style: { ...prev.content.style, [field]: value } }
    }));
  };

  // Image QR: upload immediately; the QR is only usable once the server confirms storage
  const uploadImageFile = async (file) => {
    const seq = ++uploadSeq.current;
    setUploadStatus('uploading');
    setUploadError('');
    handleInputChange('imageId', '');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await qrAPI.uploadImage(fd);
      if (seq !== uploadSeq.current) return;
      if (!res.data?.imageId) throw new Error('Upload was not confirmed by the server');
      handleInputChange('imageId', res.data.imageId);
      setUploadStatus('uploaded');
    } catch (err) {
      if (seq !== uploadSeq.current) return;
      setUploadStatus('error');
      setUploadError(err.response?.data?.message || err.message || 'Upload failed');
    }
  };

  const handleImageFile = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    uploadImageFile(file);
  };

  const handleImageClear = () => {
    clearImage();
    handleInputChange('imageId', '');
  };

  // Logo overlay
  const handleLogoFile = async (file) => {
    try {
      const dataUrl = await fileToResizedDataUrl(file, 256);
      setLogoFile(file);
      setCustomization(prev => ({ ...prev, logo: dataUrl, errorCorrectionLevel: 'H' }));
    } catch {
      toast.error('Could not read the logo image');
    }
  };

  const handleLogoClear = () => {
    setLogoFile(null);
    setCustomization(prev => ({ ...prev, logo: '' }));
  };

  const buildSaveContent = () => {
    const c = formData.content;
    if (activeTab === 'emoji') {
      return { emojis: c.emojis, title: c.title || '', message: c.message || '', style: c.style };
    }
    if (activeTab === 'image') {
      return { imageId: c.imageId, caption: c.caption || '' };
    }
    return c;
  };

  const handleSave = async () => {
    if (!formData.title || !contentReady) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await qrAPI.generate({
        title: formData.title,
        type: activeTab,
        content: buildSaveContent(),
        customization,
      });
      const qrCode = response.data.qrCode;
      let finalImage = qrCode.qrImage;

      // The server renders the plain code; overlay the logo and store the composited image
      if (customization.logo) {
        try {
          finalImage = await composeQrWithLogo(qrCode.qrImage, customization.logo, {
            logoSize: customization.logoSize,
            logoBackground: customization.logoBackground,
            backgroundColor: customization.backgroundColor,
          });
          await qrAPI.update(qrCode._id, { qrImage: finalImage });
        } catch {
          finalImage = qrCode.qrImage;
          toast.warning('QR code saved, but the logo could not be applied');
        }
      }

      toast.success('QR Code created successfully!');
      if (VIEWER_TYPES.includes(activeTab)) {
        setSaved({ qrImage: finalImage, viewerUrl: response.data.viewerUrl });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const data = error.response?.data;
      toast.error(data?.message || data?.errors?.[0]?.msg || 'Error creating QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(saved.viewerUrl);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const startOver = () => {
    setSaved(null);
    setFormData({ title: '', type: activeTab, content: initialContent(activeTab) });
    clearImage();
  };

  const renderUploadStatus = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading image…</span>
          </div>
        );
      case 'uploaded':
        return (
          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span>Image uploaded and stored</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-wrap items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{uploadError}</span>
            {imageFile && (
              <button type="button" onClick={() => uploadImageFile(imageFile)} className="underline font-medium">
                Retry
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderContentForm = () => {
    switch (activeTab) {
      case 'url':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Website URL *
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={formData.content.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Text Content *
              </label>
              <textarea
                rows={4}
                placeholder="Enter your text message..."
                value={formData.content.text || ''}
                onChange={(e) => handleInputChange('text', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Network Name (SSID) *
              </label>
              <input
                type="text"
                placeholder="My WiFi Network"
                value={formData.content.ssid || ''}
                onChange={(e) => handleInputChange('ssid', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Password {formData.content.security === 'nopass' ? '' : '*'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="WiFi password"
                  value={formData.content.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`${inputClass} pr-10`}
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
              <label className={labelClass}>
                Security Type
              </label>
              <select
                value={formData.content.security || 'WPA'}
                onChange={(e) => handleInputChange('security', e.target.value)}
                className={inputClass}
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
                <label className={labelClass}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.content.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.content.organization || ''}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.content.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.content.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Website
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={formData.content.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                File URL *
              </label>
              <input
                type="url"
                placeholder="https://example.com/brochure.pdf"
                value={formData.content.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Link to a document hosted online (e.g. Google Drive, Dropbox).
              </p>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Image *
              </label>
              <FileUpload
                file={imageFile}
                preview={imagePreview}
                onFile={handleImageFile}
                onClear={handleImageClear}
                onError={(message) => toast.error(message)}
                label="Drag & drop the image to share, or click to select"
              />
              <div className="mt-2">{renderUploadStatus()}</div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="mt-3 max-h-64 w-auto mx-auto rounded-xl border border-gray-200 dark:border-gray-600 object-contain"
                />
              )}
            </div>
            <div>
              <label className={labelClass}>
                Caption
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="Optional caption shown under the image"
                value={formData.content.caption || ''}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                className={inputClass}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Scanning the QR code opens a page showing the full image.
            </p>
          </div>
        );

      case 'emoji': {
        const style = formData.content.style || {};
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Emojis * <span className="font-normal text-gray-500">(select one or more)</span>
              </label>
              <EmojiPicker
                selected={formData.content.emojis || []}
                onToggle={toggleEmoji}
                onClear={() => handleInputChange('emojis', [])}
              />
            </div>
            <div>
              <label className={labelClass}>
                Heading
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="Optional heading, e.g. Happy Birthday!"
                value={formData.content.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Message
              </label>
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Optional message shown with the emojis"
                value={formData.content.message || ''}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Page Background
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_BACKGROUNDS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleEmojiStyle('background', color)}
                      aria-label={`Background ${color}`}
                      className={`w-8 h-8 rounded-full border-2 ${style.background === color ? 'border-primary-500 ring-2 ring-primary-300' : 'border-gray-300 dark:border-gray-600'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Emoji Size
                </label>
                <select
                  value={style.size || 'md'}
                  onChange={(e) => handleEmojiStyle('size', e.target.value)}
                  className={inputClass}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>
            {(formData.content.emojis || []).length > 0 && (
              <div
                className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 text-center"
                style={{ backgroundColor: style.background || '#ffffff' }}
              >
                {formData.content.title && <p className="font-bold text-gray-900 mb-2">{formData.content.title}</p>}
                <div className="text-4xl flex flex-wrap justify-center gap-1">{formData.content.emojis.join(' ')}</div>
                {formData.content.message && <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{formData.content.message}</p>}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const downloadDisabledReason = saved
    ? ''
    : isPlaceholder && isViewerType
      ? 'This preview uses a placeholder link. Create the QR code to get the final, scannable version for download.'
      : '';

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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {QR_TYPES.map((type) => {
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Error Correction
                </label>
                <select
                  value={customization.errorCorrectionLevel}
                  disabled={!!customization.logo}
                  onChange={(e) => setCustomization(prev => ({ ...prev, errorCorrectionLevel: e.target.value }))}
                  className={`${inputClass} disabled:opacity-60`}
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
                {customization.logo && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">High is required while a logo is added.</p>
                )}
              </div>
            </div>

            {/* Logo overlay */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Layers className="h-4 w-4 text-primary-600" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Center Logo (optional)</h3>
              </div>
              <FileUpload
                file={logoFile}
                preview={customization.logo}
                onFile={handleLogoFile}
                onClear={handleLogoClear}
                onError={(message) => toast.error(message)}
                maxSize={2 * 1024 * 1024}
                label="Drag & drop a logo, or click to select"
                hint="JPG, PNG, WebP up to 2MB — square logos work best"
              />
              {customization.logo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Logo Size: <span className="text-primary-600 font-bold">{Math.round(customization.logoSize * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="25"
                      value={Math.round(customization.logoSize * 100)}
                      onChange={(e) => setCustomization(prev => ({ ...prev, logoSize: parseInt(e.target.value) / 100 }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <label className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300 md:mt-8">
                    <input
                      type="checkbox"
                      checked={customization.logoBackground}
                      onChange={(e) => setCustomization(prev => ({ ...prev, logoBackground: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>Solid background behind logo</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePreview}
              disabled={!contentReady}
              className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 px-8 rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <Eye className="h-5 w-5" />
              <span>Generate Preview</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !!saved || !formData.title || !contentReady || uploadStatus === 'uploading'}
              className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-primary-400 disabled:to-primary-400 text-white py-4 px-8 rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Creating...' : saved ? 'Created' : 'Create QR Code'}</span>
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
                  {saved ? 'Your QR Code' : 'Live Preview'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {saved ? 'Saved and ready to scan' : 'Your QR code will appear here'}
                </p>
              </div>

              {saved && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-left">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300 font-semibold text-sm mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Share link</span>
                  </div>
                  <a href={saved.viewerUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary-600 break-all hover:underline">
                    {saved.viewerUrl}
                  </a>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button type="button" onClick={copyShareLink} className="flex items-center justify-center space-x-1 text-xs font-semibold py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700">
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </button>
                    <button type="button" onClick={startOver} className="flex items-center justify-center space-x-1 text-xs font-semibold py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700">
                      <RotateCcw className="h-3 w-3" />
                      <span>New</span>
                    </button>
                  </div>
                </div>
              )}

              <QrPreview
                qrData={saved ? saved.qrImage : qrImage}
                logoData={saved ? '' : customization.logo}
                customization={customization}
                downloadDisabledReason={downloadDisabledReason}
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
