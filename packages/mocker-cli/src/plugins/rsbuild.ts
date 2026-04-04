import type { RsbuildPlugin } from '@rsbuild/core';
import { fairysMockerBase } from '../base.js';
import { utilsGlobalVariable } from '../utils/utils.js';

export const fairysMockerRsbuildPlugin = () => ({
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      fairysMockerBase.initApp(server.middlewares, () => {
        fairysMockerBase.logServer(server.port);
        // rsbuild/vite等自带websocket服务的环境下无法使用websocket服务
        utilsGlobalVariable.isEnableWebsocket = false;
      });
      // @ts-ignore
      fairysMockerBase.server = server.httpServer
    });
  },
} as RsbuildPlugin);
