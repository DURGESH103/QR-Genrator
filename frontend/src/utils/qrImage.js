const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Could not load image'));
  img.src = src;
});

const roundedRect = (ctx, x, y, w, h, r) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
};

// Draw a logo centered over a QR code image. logoSize is the logo's width as a fraction of the QR width.
export const composeQrWithLogo = async (qrSrc, logoSrc, { logoSize = 0.22, logoBackground = true, backgroundColor = '#ffffff' } = {}) => {
  const [qrImg, logoImg] = await Promise.all([loadImage(qrSrc), loadImage(logoSrc)]);
  const canvas = document.createElement('canvas');
  canvas.width = qrImg.width;
  canvas.height = qrImg.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(qrImg, 0, 0);

  // Fit the logo into a square box, preserving its aspect ratio
  const box = Math.round(canvas.width * logoSize);
  const scale = Math.min(box / logoImg.width, box / logoImg.height);
  const lw = Math.round(logoImg.width * scale);
  const lh = Math.round(logoImg.height * scale);
  const lx = Math.round((canvas.width - lw) / 2);
  const ly = Math.round((canvas.height - lh) / 2);

  if (logoBackground) {
    const pad = Math.max(4, Math.round(box * 0.08));
    ctx.fillStyle = backgroundColor;
    roundedRect(ctx, lx - pad, ly - pad, lw + pad * 2, lh + pad * 2, pad);
  }
  ctx.drawImage(logoImg, lx, ly, lw, lh);
  return canvas.toDataURL('image/png');
};

export const toJpegDataUrl = async (src, backgroundColor = '#ffffff') => {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
};

// Read an image file as a PNG data URL, downscaled so its longest side is at most maxDim
export const fileToResizedDataUrl = async (file, maxDim = 256) => {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
