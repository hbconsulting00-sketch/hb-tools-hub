// Build-time assembly: concatenates the approved card-generator parts into
// public/cards/generator.html. Parts live in public/cards/gen-parts/ because
// GitHub's web editor caps single-file edits; bytes must stay exact.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'public', 'cards', 'gen-parts');
const parts = ['part1.txt', 'part2.txt', 'part3.txt', 'part4.txt', 'part5.txt', 'part6.txt'];
const buf = Buffer.concat(parts.map((p) => fs.readFileSync(path.join(dir, p))));
const out = path.join(__dirname, '..', 'public', 'cards', 'generator.html');
fs.writeFileSync(out, buf);
console.log('assembled public/cards/generator.html:', buf.length, 'bytes');
