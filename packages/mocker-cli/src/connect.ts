
import connect from 'connect';
import chalk from 'chalk';
import { fairysMockerBase } from './base.js';
import { detect } from 'detect-port';

export class FairysMockerConnect {
  base = fairysMockerBase;
  /**创建 app*/
  createApp = (cb?: () => void) => {
    return fairysMockerBase.initApp(connect(), cb)
  }

  // 使用 connect
  /**检测端口，返回实际端口*/
  detectPort = (port?: number) => {
    /**启动服务器*/
    const PORT = port || process.env.PORT || 6901;
    return new Promise((resolve, reject) => {
      detect(PORT)
        .then(realPort => {
          resolve(realPort);
        })
        .catch(err => {
          reject(err);
        });
    })
  }

  /**启动服务器*/
  listen = async (port?: number, callback?: (error?: Error) => void) => {
    if (!fairysMockerBase.mainApp) {
      console.log(chalk.red('请先初始化 app'));
      return;
    }
    const app = fairysMockerBase.mainApp
    const realPort = await this.detectPort(port);
    // @ts-ignore
    fairysMockerBase.server = app.listen(realPort, (...rest: any) => {
      fairysMockerBase.logServer(realPort as number);
      callback?.(...rest);
    });
    return fairysMockerBase.server
  }

  staticServer = fairysMockerBase.staticServer;

  /**启动 app*/
  start = (cb?: () => void) => {
    this.createApp(cb);
    this.listen();
  }

  close = () => {
    if (fairysMockerBase.server) {
      fairysMockerBase.server.close();
    }
  }
}

export const fairysMockerConnect = new FairysMockerConnect();

