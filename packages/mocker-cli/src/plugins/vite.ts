import type { PluginOption } from 'vite'
import { fairysMockerBase } from '../base.js';
import { utilsGlobalVariable, UtilsGlobalVariableOptions } from '../utils/utils.js';

export interface FairysMockerVitePluginOptions extends UtilsGlobalVariableOptions {

}

export const fairysMockerVitePlugin = (options: FairysMockerVitePluginOptions = {}) => ({
  name: 'fairys_mocker_vite_plugin',
  configureServer(server) {
    // 返回一个在内部中间件安装后
    utilsGlobalVariable.setOptions(options);
    fairysMockerBase.initApp(server.middlewares, {
      last() {
        const port = server.config.server.port
        fairysMockerBase.logServer(port);
      },
    });
    // @ts-ignore
    fairysMockerBase.server = server.httpServer

    // 被调用的后置钩子
    return () => {

    }
  },
} as PluginOption)
