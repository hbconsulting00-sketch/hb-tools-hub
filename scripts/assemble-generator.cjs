// Prebuild step: assemble public/cards/generator.html from the checked-in parts.
// The approved generator is too large for the GitHub web editor, so it is stored
// as public/cards/gen-parts/part1..6.txt and concatenated here at build time.
// Note: the GitHub web editor strips one trailing blank line on save, so part6
// on disk ends with a single "\n" while the approved file ends with "\n\n".
// We append the final newline here to reproduce the approved bytes exactly.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'cards', 'gen-parts');
const parts = ['part1.txt', 'part2.txt', 'part3.txt', 'part4.txt', 'part5.txt', 'part6.txt'];
const buffers = parts.map((p) => fs.readFileSync(path.join(dir, p)));
buffers.push(Buffer.from('\n'));

const out = path.join(__dirname, '..', 'public', 'cards', 'generator.html');
const result = Buffer.concat(buffers);
fs.writeFileSync(out, result);
console.log('assemble-generator: wrote ' + result.length + ' bytes to public/cards/generator.html');
