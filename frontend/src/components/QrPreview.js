import React, { useEffect, useState } from 'react';
import { Download, Share2, QrCode, AlertTriangle, Info } from 'lucide-react';
import { composeQrWithLogo, toJpegDataUrl } from '../utils/qrImage';

const QrPreview = ({ qrData, customization, onDownload, logoData, downloadDisabledReason }) => {
  const [compositeDataUrl, setCompositeDataUrl] = useState('');
  const [logoError, setLogoError] = useState(false);

  // Compose QR + logo whenever either changes; ignore results from stale renders
  useEffect(() => {
    let cancelled = false;
    setLogoError(false);
    if (!qrData || !logoData) { setCompositeDataUrl(''); return undefined; }

    composeQrWithLogo(qrData, logoData, {
      logoSize: customization?.logoSize,
      logoBackground: customization?.logoBackground !== false,
      backgroundColor: customization?.backgroundColor || '#ffffff',
    })
      .then(url => { if (!cancelled) setCompositeDataUrl(url); })
      .catch(() => { if (!cancelled) { setCompositeDataUrl(''); setLogoError(true); } });

    return () => { cancelled = true; };
  }, [qrData, logoData, customization?.logoSize, customization?.logoBackground, customization?.backgroundColor]);

  // Logos above ~25% of the width, or without level H correction, often fail to scan
  const logoWarning = !!logoData && ((customization?.logoSize || 0.22) > 0.25 || (customization?.errorCorrectionLevel || 'H') !== 'H');
  const fileBase = `qr-code-${Date.now()}`;

  const downloadPNG = () => {
    const src = compositeDataUrl || qrData;
    if (!src || downloadDisabledReason) return;
    const link = document.createElement('a');
    link.download = `${fileBase}.png`;
    link.href = src;
    link.click();
    if (onDownload) onDownload();
  };

  const downloadJPG = async () => {
    const src = compositeDataUrl || qrData;
    if (!src || downloadDisabledReason) return;
    const link = document.createElement('a');
    link.download = `${fileBase}.jpg`;
    link.href = await toJpegDataUrl(src, customization?.backgroundColor || '#ffffff');
    link.click();
    if (onDownload) onDownload();
  };

  const shareQR = async () => {
    const src = compositeDataUrl || qrData;
    if (navigator.share && src) {
      try {
        await navigator.share({ title: 'QR Code', text: 'Check out this QR code', url: window.location.href });
      } catch {}
    }
  };

  if (!qrData) {
    return (
      <div className="text-center">
        <div className="w-64 h-64 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-500">
          <div className="text-center">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Preview will appear here</p>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Fill in the content to generate preview</p>
      </div>
    );
  }

  const displaySrc = compositeDataUrl || qrData;

  return (
    <div className="text-center">
      {logoError && (
        <div className="mb-3 flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-xs">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Could not load the logo image.</span>
        </div>
      )}

      {logoWarning && (
        <div className="mb-3 flex items-center space-x-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 text-xs">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Logo may be too large — keep it at 25% or less for reliable scanning.</span>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div
          className="p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600"
          style={{ backgroundColor: customization?.backgroundColor || '#ffffff' }}
        >
          <img
            src={displaySrc}
            alt="QR Code"
            className="w-56 h-56 object-contain rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-3">
        {downloadDisabledReason && (
          <div className="flex items-start space-x-2 text-left text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 text-xs">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{downloadDisabledReason}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadPNG}
            disabled={!!downloadDisabledReason}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 px-4 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>PNG</span>
          </button>
          <button
            onClick={downloadJPG}
            disabled={!!downloadDisabledReason}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-4 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
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
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">QR Code Details</h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="font-medium">{customization?.size || 200}px</span>
          </div>
          <div className="flex justify-between">
            <span>Error Correction:</span>
            <span className="font-medium">{customization?.errorCorrectionLevel || 'H'}</span>
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
