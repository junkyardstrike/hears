const fs = require('fs');

const filePath = 'merchant.bmp';
const buffer = fs.readFileSync(filePath);

// BMP header is 54 bytes. Pixels start at offset in buffer[10]
const pixelOffset = buffer.readUInt32LE(10);

for (let i = pixelOffset; i < buffer.length; i += 3) {
  const b = buffer[i];
  const g = buffer[i + 1];
  const r = buffer[i + 2];

  // If pixel is near white (R,G,B > 240)
  if (r > 240 && g > 240 && b > 240) {
    buffer[i] = 0;
    buffer[i + 1] = 0;
    buffer[i + 2] = 0;
  }
}

fs.writeFileSync('merchant_black.bmp', buffer);
console.log('Processed BMP');
