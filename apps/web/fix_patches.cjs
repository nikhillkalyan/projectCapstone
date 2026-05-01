const fs = require('fs');

const files = ['patch_create_course.cjs', 'patch_uni_course.cjs'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("fs.readFileSync(file, 'utf8');", "fs.readFileSync(file, 'utf8').replace(/\\r\\n/g, '\\n');");
  fs.writeFileSync(file, content);
});
console.log('Fixed patch scripts');
