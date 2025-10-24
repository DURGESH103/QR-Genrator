import React, { useRef } from 'react';
import { Download, Share2, Eye, QrCode } from 'lucide-react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

const QrPreview = ({ qrData, customization, onDownload }) => {
  const qrRef = useRef();

  const downloadQR = async (format = 'png') => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: customization?.backgroundColor || '#ffffff',
        scale: 2,
      });

      if (format === 'png') {
        canvas.toBlob((blob) => {
          saveAs(blob, `qr-code-${Date.now()}.png`);
        });
      } else if (format === 'jpg') {
        canvas.toBlob((blob) => {
          saveAs(blob, `qr-code-${Date.now()}.jpg`);
        }, 'image/jpeg');
      }

      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const shareQR = async () => {
    if (navigator.share && qrData) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (!qrData) {
    return (
      <div className="text-center">
        <div className="w-64 h-64 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-500">
          <div className="text-center">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Preview will appear here
            </p>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
          Fill in the content to generate preview
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div
          ref={qrRef}
          className="p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600"
          style={{
            backgroundColor: customization?.backgroundColor || '#ffffff',
          }}
        >
          <img
            src={qrData}
            alt="QR Code"
            className="w-64 h-64 object-contain rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => downloadQR('png')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 px-4 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>PNG</span>
          </button>
          <button
            onClick={() => downloadQR('jpg')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-4 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>JPG</span>
          </button>
        </div>
        
        <button
          onClick={shareQR}
          className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl transition-all duration-200 font-semibold"
        >
          <Share2 className="h-4 w-4" />
          <span>Share QR Code</span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          QR Code Details
        </h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="font-medium">{customization?.size || 200}px</span>
          </div>
          <div className="flex justify-between">
            <span>Format:</span>
            <span className="font-medium">PNG/JPG</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Background:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: customization?.backgroundColor || '#ffffff' }}></div>
              <span className="font-medium">{customization?.backgroundColor || '#ffffff'}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Foreground:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: customization?.foregroundColor || '#000000' }}></div>
              <span className="font-medium">{customization?.foregroundColor || '#000000'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrPreview;