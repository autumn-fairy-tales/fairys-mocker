import { defineConfig, } from '@rsbuild/core';
import { pluginReact, } from '@rsbuild/plugin-react';
import { fairysMockerRsbuildPlugin } from '@fairys/mocker-cli';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    fairysMockerRsbuildPlugin(),
    pluginReact(),
  ],

});
