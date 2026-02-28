const fs = require('fs');
let content = fs.readFileSync('routes/projects.js', 'utf8');
content = content.replace(
  'const { title, description, category, tags, cover_image, live_url, github_url, tech_stack, status } = req.body;',
  'const { title, description, category, tags, cover_image, live_url, github_url, tech_stack, status, open_for_collaboration } = req.body;'
);
content = content.replace(
  'status: status || p.status,',
  'status: status || p.status,\n      open_for_collaboration: open_for_collaboration ?? p.open_for_collaboration,'
);
fs.writeFileSync('routes/projects.js', content);
console.log('Patched projects.js');
