const url = process.argv[2] || 'http://localhost:3000/our-story';
const html = await fetch(url).then((r) => r.text());

const headEnd = html.indexOf('</head>');
const bodyStart = html.indexOf('<body');
const first500AfterBody = html.slice(bodyStart, bodyStart + 2500);

console.log('head length', headEnd);
console.log('has title in head section', html.slice(0, headEnd).includes('<title'));
console.log('meta count before </head>', (html.slice(0, headEnd).match(/<meta\b/gi) || []).length);
console.log('title count before </head>', (html.slice(0, headEnd).match(/<title\b/gi) || []).length);

const titleInHead = html.slice(0, headEnd).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
console.log('head title:', titleInHead?.[1]?.trim() || 'none');

const metaInBodySample = first500AfterBody.match(/<meta[^>]+>/gi)?.slice(0, 3) || [];
console.log('first body meta samples:', metaInBodySample);

const titleInBody = html.slice(bodyStart).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
console.log('body title:', titleInBody?.[1]?.trim() || 'none');
