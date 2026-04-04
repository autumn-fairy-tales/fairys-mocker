import type { RsbuildPlugin } from '@rsbuild/core';
import { fairysMockerBase } from '../base.js';

export const fairysMockerRsbuildPlugin = () => ({
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      fairysMockerBase.initApp(server.middlewares, () => {
        fairysMockerBase.logServer(server.port);
      });
      // @ts-ignore
      fairysMockerBase.server = server.httpServer
    });
  },
} as RsbuildPlugin);
