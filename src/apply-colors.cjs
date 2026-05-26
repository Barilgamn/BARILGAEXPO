const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Colors to apply:
// Blue: blue-900, blue-950 (Main backgrounds, headings)
// Red: red-600 (Primary buttons, important accents)
// Emerald: emerald-500, emerald-600 (Secondary accents, icons)

// 1. Navbar & Hero & Footer Backgrounds and Primary Headings
content = content.replace(/bg-red-800/g, 'bg-blue-900');
content = content.replace(/from-red-800/g, 'from-blue-900');
content = content.replace(/via-red-800/g, 'via-blue-900');
content = content.replace(/to-red-800/g, 'to-blue-900');

content = content.replace(/from-red-900/g, 'from-blue-950');
content = content.replace(/bg-red-900/g, 'bg-blue-950');

content = content.replace(/text-red-800/g, 'text-blue-900');
content = content.replace(/group-hover:text-red-800/g, 'group-hover:text-blue-900');

// 2. Hero Text Gradient (2026) -> Make it red to yellow or emerald to blue?
content = content.replace(/from-red-500 to-red-700/g, 'from-emerald-400 to-emerald-600');

// 3. Icons in Hero
// Calendar, MapPin inside Hero
content = content.replace(/text-red-500/g, 'text-emerald-500'); 
// (This will also affect "Үзэсгэлэн эхлэхэд:" and other text-red-500, making them emerald, which is good)

// 4. About Section
// "Бидний тухай" subtitle
// w-20 h-1.5 bg-red-600 -> let's keep red-600 for lines, or change to red-600 (already red-600)
// The numbers 100+, 400+ have text-red-600 for the plus sign.
content = content.replace(/text-red-600/g, 'text-red-600'); // No-op, just to note
content = content.replace(/bg-red-100/g, 'bg-blue-50');
content = content.replace(/border-red-100/g, 'border-emerald-100'); // Categories borders

// 5. Categories Section
// w-16 h-16 bg-red-50 text-red-800 -> let's change these icon boxes to emerald
content = content.replace(/bg-red-50 text-blue-900/g, 'bg-emerald-50 text-emerald-600');
content = content.replace(/group-hover:bg-red-800/g, 'group-hover:bg-emerald-600');

// List bullets in categories
// <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0" />
// We can change just the bullets to emerald-500 if we want, but red-600 is fine too. Let's make them emerald-500.

// 6. Registration Modal
// text-red-800 -> text-blue-900 (already handled above)
// bg-red-50 text-blue-900 -> handled above
// text-green-500 is used for success (CheckCircle), let's keep it.

fs.writeFileSync('src/App.tsx', content, 'utf8');
