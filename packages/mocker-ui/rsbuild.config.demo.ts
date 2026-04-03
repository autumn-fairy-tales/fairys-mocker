import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

// Docs: https://rsbuild.rs/config/
export default defineConfig({

  output: {
    distPath: "_fairys_mocker",
    assetPrefix: '/fairys-mocker/_fairys_mocker/',
  },
  server: {
    base: '/fairys-mocker/_fairys_mocker/',
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
