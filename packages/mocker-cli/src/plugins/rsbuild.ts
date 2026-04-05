import type { RsbuildPlugin } from '@rsbuild/core';
import { fairysMockerBase } from '../base.js';
import { utilsGlobalVariable, UtilsGlobalVariableOptions } from '../utils/utils.js';

export interface FairysMockerRsbuildPluginOptions extends Omit<UtilsGlobalVariableOptions, 'isEnableWebsocket'> {

}

export const fairysMockerRsbuildPlugin = (options: FairysMockerRsbuildPluginOptions = {}) => ({
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      // @ts-ignore
      const { isEnableWebsocket, ...restOptions } = options;
      utilsGlobalVariable.setOptions(restOptions);
      fairysMockerBase.initApp(server.middlewares, {
        beforeRegisterMockProxyRoutes() {
          // rsbuild/vite等自带websocket服务的环境下无法使用websocket服务
          utilsGlobalVariable.isEnableWebsocket = false;
        },
        last() {
          fairysMockerBase.logServer(server.port);
        },
      });
      // @ts-ignore
      fairysMockerBase.server = server.httpServer
    });
  },
} as RsbuildPlugin);
