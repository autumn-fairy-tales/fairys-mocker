import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  output: {
    assetPrefix: '/ui/',
  },
  server: {
    base: '/ui/',
  },
  html: {
    title: 'Fairys Mocker',
  },
  plugins: [pluginReact()],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [tailwindcss()],
      },
    },
  },
});
