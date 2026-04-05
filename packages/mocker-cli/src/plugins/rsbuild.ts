import type { RsbuildPlugin } from '@rsbuild/core';
import { fairysMockerBase } from '../base.js';
import { utilsGlobalVariable, UtilsGlobalVariableOptions } from '../utils/utils.js';

export interface FairysMockerRsbuildPluginOptions extends UtilsGlobalVariableOptions {

}

export const fairysMockerRsbuildPlugin = (options: FairysMockerRsbuildPluginOptions = {}) => ({
  setup(api) {
    api.onBeforeStartDevServer(({ server }) => {
      utilsGlobalVariable.setOptions(options);
      fairysMockerBase.initApp(server.middlewares, {

        last() {
          fairysMockerBase.logServer(server.port);
        },
      });
      // @ts-ignore
      fairysMockerBase.server = server.httpServer
    });
  },
} as RsbuildPlugin);
