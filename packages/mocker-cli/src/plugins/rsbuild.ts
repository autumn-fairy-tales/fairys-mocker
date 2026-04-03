import type { RsbuildPlugin } from '@rsbuild/core';
import { fairysMockerBase } from '../base.js';

export const fairysMockerRsbuildPlugin = () => ({
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      fairysMockerBase.initApp(server.middlewares);
      // @ts-ignore
      fairysMockerBase.server = server.httpServer
      fairysMockerBase.logServer(server.port);
    });
  },
} as RsbuildPlugin);
