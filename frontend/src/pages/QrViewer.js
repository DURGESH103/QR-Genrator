import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, AlertTriangle } from 'lucide-react';
import { publicAPI, qrAPI } from '../utils/api';

const EMOJI_SIZES = {
  sm: 'text-5xl sm:text-6xl',
  md: 'text-6xl sm:text-7xl',
  lg: 'text-7xl sm:text-8xl',
};

// Public page a scanned Emoji / Image QR code opens. Rendered outside the app layout.
const QrViewer = () => {
  const { id } = useParams();
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('loading');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    publicAPI.getQr(id)
      .then(res => {
        if (cancelled) return;
        setQr(res.data.qrCode);
        setStatus('ready');
        qrAPI.trackScan(id).catch(() => {});
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (qr?.title) document.title = qr.title;
  }, [qr]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (status === 'error' || !qr) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">QR code not found</h1>
          <p className="text-gray-600 dark:text-gray-400">This QR code may have been deleted or deactivated.</p>
        </div>
      </div>
    );
  }

  const { content } = qr;

  if (qr.type === 'image') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-950">
        <main className="flex-1 flex items-center justify-center p-2 sm:p-6">
          {imageFailed ? (
            <div className="text-center text-gray-300 px-4">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <p>The image could not be loaded.</p>
            </div>
          ) : (
            <img
              src={publicAPI.imageUrl(content.imageUrl)}
              alt={content.caption || qr.title}
              onError={() => setImageFailed(true)}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          )}
        </main>
        {content.caption && (
          <p className="text-center text-gray-200 text-base sm:text-lg px-4 pb-6 break-words">{content.caption}</p>
        )}
      </div>
    );
  }

  const background = content.style?.background || '#ffffff';
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: background }}>
      <div className="w-full max-w-xl text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-3xl shadow-xl p-6 sm:p-10">
        {content.title && (
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 break-words">{content.title}</h1>
        )}
        <div className={`${EMOJI_SIZES[content.style?.size] || EMOJI_SIZES.md} leading-tight flex flex-wrap justify-center gap-2 sm:gap-3`} role="img" aria-label="Emojis">
          {content.emojis.map((emoji, i) => <span key={i}>{emoji}</span>)}
        </div>
        {content.message && (
          <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 whitespace-pre-line break-words">{content.message}</p>
        )}
        <div className="mt-8 flex items-center justify-center space-x-1 text-xs text-gray-400">
          <QrCode className="h-3 w-3" />
          <span>Shared via QR code</span>
        </div>
      </div>
    </div>
  );
};

export default QrViewer;
