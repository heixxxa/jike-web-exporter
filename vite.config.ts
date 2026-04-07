import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

import preact from '@preact/preset-vite';
import monkey from 'vite-plugin-monkey';
import i18nextLoader from 'vite-plugin-i18next-loader';

import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import prefixSelector from 'postcss-prefix-selector';
import remToPx from 'postcss-rem-to-pixel-next';
import { APP_ROOT_ID } from './src/constants/app';

const appRootSelector = `#${APP_ROOT_ID}`;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const JIKE_ICON_SVG =
  '<svg width="38" height="37" viewBox="0 0 38 37" fill="none" xmlns="http://www.w3.org/2000/svg" class="_logoLight_124w8_16"><path d="M29.0824 0H8.78504C4.20934 0 0.5 3.70934 0.5 8.28504V28.5824C0.5 33.1581 4.20934 36.8675 8.78504 36.8675H29.0824C33.6581 36.8675 37.3675 33.1581 37.3675 28.5824V8.28504C37.3675 3.70934 33.6581 0 29.0824 0Z" fill="#FFE411"></path><path d="M14.8856 30.1234L12.1737 26.2888C12.1219 26.2145 12.1015 26.1227 12.1168 26.0334C12.1321 25.9441 12.182 25.8644 12.2557 25.8116L14.0489 24.5503C15.9031 23.2384 17.011 21.42 17.011 18.83V7.14769C17.011 7.05717 17.0468 6.97032 17.1106 6.90612C17.1744 6.84192 17.261 6.80557 17.3516 6.80502H22.1363V18.8258C22.1363 23.5412 20.8224 25.8936 16.9563 28.6602L14.8856 30.1234Z" fill="white"></path><path d="M21.9953 6.80708V18.6239C21.9953 23.3414 20.6813 25.6939 16.8153 28.4583L14.7424 29.9299L15.7305 31.3237C15.7561 31.3606 15.7888 31.392 15.8266 31.4161C15.8644 31.4402 15.9067 31.4565 15.9509 31.4641C15.9951 31.4718 16.0404 31.4705 16.0841 31.4605C16.1278 31.4505 16.1691 31.4318 16.2056 31.4057L18.0073 30.1317C20.3008 28.492 21.7367 26.9783 22.6638 25.244C23.6245 23.4444 24.045 21.4052 24.045 18.6239V7.14765C24.045 7.05677 24.0089 6.96961 23.9446 6.90534C23.8803 6.84108 23.7932 6.80498 23.7023 6.80498L21.9953 6.80708Z" fill="url(#jike-logo_svg-paint0_linear_1615_6281)"></path><defs><linearGradient id="jike-logo_svg-paint0_linear_1615_6281" x1="19.3948" y1="6.80708" x2="19.3948" y2="26.6567" gradientUnits="userSpaceOnUse"><stop stop-color="#F0FFFF"></stop><stop offset="0.11" stop-color="#DDFAFE"></stop><stop offset="0.33" stop-color="#ADEBFA"></stop><stop offset="0.64" stop-color="#60D4F5"></stop><stop offset="1" stop-color="#00B8EE"></stop></linearGradient></defs></svg>';
const JIKE_ICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(JIKE_ICON_SVG)}`;

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: false,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
        remToPx({ propList: ['*'] }),
        // Use scoped CSS.
        prefixSelector({
          prefix: appRootSelector,
          exclude: [new RegExp(`^${escapeRegExp(appRootSelector)}`)],
        }),
      ],
    },
  },
  plugins: [
    preact(),
    i18nextLoader({ paths: ['./src/i18n/locales'], namespaceResolution: 'basename' }),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: {
          '': 'Jike Web Exporter',
          'zh-CN': '即刻数据导出工具',
        },
        description: {
          '': 'Export posts and comments to JSON/CSV/HTML from Jike web app.',
          'zh-CN': '从即刻网页版导出动态和评论为 JSON/CSV/HTML。',
        },
        icon: JIKE_ICON_DATA_URI,
        namespace: 'https://github.com/heixxxa',
        match: ['https://web.okjike.com/*'],
        grant: ['unsafeWindow', 'GM_registerMenuCommand'],
        'run-at': 'document-start',
        updateURL:
          'https://github.com/heixxxa/jike-web-exporter/releases/latest/download/jike-web-exporter.user.js',
        downloadURL:
          'https://github.com/heixxxa/jike-web-exporter/releases/latest/download/jike-web-exporter.user.js',
        require: [
          'https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js',
          'https://cdn.jsdelivr.net/npm/dexie@4.0.11/dist/dexie.min.js',
          'https://cdn.jsdelivr.net/npm/dexie-export-import@4.1.4/dist/dexie-export-import.js',
          'https://cdn.jsdelivr.net/npm/file-saver-es@2.0.5/dist/FileSaver.min.js',
          'https://cdn.jsdelivr.net/npm/i18next@24.2.3/i18next.min.js',
          'https://cdn.jsdelivr.net/npm/preact@10.26.4/dist/preact.min.js',
          'https://cdn.jsdelivr.net/npm/preact@10.26.4/hooks/dist/hooks.umd.js',
          'https://cdn.jsdelivr.net/npm/@preact/signals-core@1.8.0/dist/signals-core.min.js',
          'https://cdn.jsdelivr.net/npm/@preact/signals@2.0.0/dist/signals.min.js',
          'https://cdn.jsdelivr.net/npm/@tanstack/table-core@8.21.2/build/umd/index.production.js',
        ],
      },
      build: {
        externalGlobals: {
          dayjs: 'dayjs',
          dexie: 'Dexie',
          'dexie-export-import': 'DexieExportImport',
          'file-saver-es': 'FileSaver',
          i18next: 'i18next',
          preact: 'preact',
          'preact/hooks': 'preactHooks',
          '@preact/signals': 'preactSignals',
          '@tanstack/table-core': 'TableCore',
        },
      },
    }),
  ],
});
