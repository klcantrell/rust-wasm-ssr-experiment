import { compile, preprocess } from 'svelte/compiler';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs';

const appCode = fs.readFileSync('./src/App.svelte', 'utf-8');

const preprocessed = await preprocess(appCode, vitePreprocess({}));

const { js: ssrJs, css } = compile(preprocessed.code, {
  generate: 'ssr',
});

const { js: domJs } = compile(preprocessed.code, {
  generate: 'dom',
  hydratable: true,
  css: 'external',
});

fs.writeFileSync('./generated/AppSsr.js', ssrJs.code, { flag: 'w' });
fs.writeFileSync('./generated/style.css', css.code, { flag: 'w' });
fs.writeFileSync('./generated/AppDom.js', domJs.code, { flag: 'w' });
