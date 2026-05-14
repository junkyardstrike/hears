const fs = require('fs');

function checkPixels(path) {
    const buf = fs.readFileSync(path);
    // For PNG/BMP, just look at some bytes
    console.log(`--- ${path} ---`);
    console.log(buf.slice(0, 100).toString('hex'));
}

checkPixels('public/assets/avatars/mage_new.png');
checkPixels('public/assets/avatars/merchant_new.png');
checkPixels('public/assets/avatars/hero_new.png');
