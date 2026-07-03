import fs from 'fs';
import path from 'path';

const searchStr = 'text-main';
const replaceStr = 'text-white';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  
  return results;
}

const srcDir = path.join(process.cwd(), 'src');
const files = walkDir(srcDir);

let changedFilesCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(searchStr)) {
    const newContent = content.replace(new RegExp(searchStr, 'g'), replaceStr);
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Reverted ${file}`);
    changedFilesCount++;
  }
});

console.log(`\nCompleted! Replaced '${searchStr}' with '${replaceStr}' in ${changedFilesCount} files.`);
