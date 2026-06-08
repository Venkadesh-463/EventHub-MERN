const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data);
    return qrCodeDataUrl;
  } catch (err) {
    console.error('QR Code generation failed', err);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateQRCode };
