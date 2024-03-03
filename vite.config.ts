import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'

import importMap from 'vuetify/dist/json/importMap.json' assert { type: 'json' }
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/ // .vue
      ],
      imports: [
        {
          from: 'vuetify/components',
          imports: Object.entries(importMap.components).map(([k, v]) => {
            return {
              name: k,
              as: undefined,
              from: `vuetify/${v.from.replace('/index.mjs', '')}`
            }
          })
        }
      ],
      dts: './auto-imports.d.ts'
    }),
    Vue(),
    VueJsx({
      include: [/\.vue$/, /\.[jt]sx?$/],
      resolveType: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
