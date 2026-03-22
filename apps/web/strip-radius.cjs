const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

console.log('Stripping extreme border-radius...');
const files = walk('./src');
let changed = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.match(/rounded-(2xl|3xl)/)) {
    console.log('Modifying:', f);
    content = content.replace(/rounded-(2xl|3xl)/g, 'rounded-md');
    fs.writeFileSync(f, content);
    changed++;
  }
});

console.log(`Done. Changed ${changed} files.`);
