import { defineConfig, RsbuildPlugin } from '@rsbuild/core';
import { pluginReact, } from '@rsbuild/plugin-react';
// import { fairysMockerBase } from '@fairys/mocker-cli';

const myPlugin = () => ({
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      // fairysMockerBase.initApp(server.middlewares);
      // console.log('before starting dev server.');
      // console.log('the server is ', server);
      // console.log('the environments contexts are: ', environments);
    });
    api.onAfterStartDevServer((options) => {
      // fairysMockerBase.logServer(options.port);
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
