const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace blues with reds (for theme background/text)
content = content.replace(/blue-900/g, 'red-800');
content = content.replace(/blue-950/g, 'red-900');
content = content.replace(/blue-50/g, 'red-50');
content = content.replace(/blue-100/g, 'red-100');

// Replace oranges with reds (for accents)
content = content.replace(/orange-400/g, 'red-500');
content = content.replace(/orange-500/g, 'red-600');
content = content.replace(/orange-600/g, 'red-700');
content = content.replace(/orange-100/g, 'red-100');

// Fix gradients
content = content.replace(/to-yellow-500/g, 'to-red-700');

fs.writeFileSync('src/App.tsx', content, 'utf8');
