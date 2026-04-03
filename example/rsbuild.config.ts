import { defineConfig, RsbuildPlugin } from '@rsbuild/core';
import { pluginReact, } from '@rsbuild/plugin-react';
import { fairysMockerBase } from '@fairys/mocker-cli';

const myPlugin = () => ({
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      fairysMockerBase.initApp(server.middlewares);
      // @ts-ignore
      fairysMockerBase.server = server.httpServer
      fairysMockerBase.logServer(server.port);
    });
  },
} as RsbuildPlugin);

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    myPlugin(),
    pluginReact(),
  ],

});
