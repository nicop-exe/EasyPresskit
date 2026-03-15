const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PresskitView.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Convert hardcoded inline colors to variables
content = content.replace(/color: '#bbb'/g, "color: 'var(--tpl-text-dim)'");
content = content.replace(/color: '#ccc'/g, "color: 'var(--tpl-text-dim)'");
content = content.replace(/color: '#888'/g, "color: 'var(--tpl-text-muted)'");
content = content.replace(/color: '#fff'/g, "color: 'var(--tpl-text-main)'");
content = content.replace(/color: '#000'/g, "color: 'var(--tpl-bg)'");
content = content.replace(/color: '#ddd'/g, "color: 'var(--tpl-text-main)'");
content = content.replace(/color: '#666'/g, "color: 'var(--tpl-text-muted)'");
content = content.replace(/background: '#0a0a0a'/g, "");
content = content.replace(/background: '#0d0d0d'/g, "background: 'var(--tpl-panel-bg)'");

fs.writeFileSync(filePath, content);
console.log('Updated PresskitView.jsx');
