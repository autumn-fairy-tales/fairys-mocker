import { defineConfig, RsbuildPlugin } from '@rsbuild/core';
import { pluginReact, } from '@rsbuild/plugin-react';
import { fairysMockerBase, fairysMockerRsbuildPlugin } from '@fairys/mocker-cli';

const myPlugin = () => ({
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      fairysMockerBase.initApp(server.middlewares);
      // @ts-ignore
      fairysMockerBase.server = server.httpServer
    });
    api.onAfterStartDevServer((options) => {
      fairysMockerBase.logServer(options.port);
    });
  },
} as RsbuildPlugin);

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    // fairysMockerRsbuildPlugin(),
    pluginReact(),
  ],

});
