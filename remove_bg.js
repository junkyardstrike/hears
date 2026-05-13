const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/assets/avatars');
const files = ['mage.png', 'merchant.png', 'hero.png'];

async function processImage(filename) {
  const filepath = path.join(dir, filename);
  const outpath = path.join(dir, 'tmp_' + filename);
  
  const { data, info } = await sharp(filepath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const isBg = (r, g, b) => r > 240 && g > 240 && b > 240;

  const queue = [[0, 0], [width-1, 0], [0, height-1], [width-1, height-1], [Math.floor(width/2), 0], [0, Math.floor(height/2)]];
  const visited = new Set();
  
  const getKey = (x, y) => `${x},${y}`;
  const idx = (x, y) => (y * width + x) * channels;

  for (const q of queue) visited.add(getKey(q[0], q[1]));

  while(queue.length > 0) {
    const [x, y] = queue.shift();
    const i = idx(x, y);
    
    if (isBg(data[i], data[i+1], data[i+2])) {
      data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 0;
      
      const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
      for(const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const k = getKey(nx, ny);
          if (!visited.has(k)) {
            visited.add(k);
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  // Also do a pass to remove strictly pure white pixels that might be detached
  for (let x=0; x<width; x++) {
    for (let y=0; y<height; y++) {
      const i = idx(x,y);
      if (data[i] > 250 && data[i+1] > 250 && data[i+2] > 250) {
        data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 0;
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outpath);
  fs.renameSync(outpath, filepath);
  console.log('Processed', filename);
}

Promise.all(files.map(processImage)).catch(console.error);
