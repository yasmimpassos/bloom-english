import { mkdir, copyFile, rm, writeFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of [
  'index.html',
  'styles.css',
  'app.js',
  'content.js',
  'learning.js',
  'help.js',
  'providers.js',
  'favicon.svg',
])
  await copyFile(file, 'dist/' + file);
await writeFile('dist/.nojekyll', '');
console.log('Build pronto em dist/');
