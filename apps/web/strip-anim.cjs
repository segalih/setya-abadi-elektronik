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

const files = walk('./src');
let changed = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/animate-in fade-in slide-in-from-[a-z]+-\d+/g, "")
                          .replace(/animate-in fade-in/g, "")
                          .replace(/transition-all/g, "transition-none")
                          .replace(/duration-\d{3,4}/g, "")
                          .replace(/\btransition-transform\b/g, "");
                          
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    changed++;
  }
});

console.log('Stripped animations from ' + changed + ' files.');
