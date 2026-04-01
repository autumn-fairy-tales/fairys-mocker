import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

// Docs: https://rsbuild.rs/config/
export default defineConfig({

  output: {
    distPath: "demo",
    assetPrefix: '/fairys-mocker/ui/',
  },
  server: {
    base: '/fairys-mocker/ui/',
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
