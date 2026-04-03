
import express from 'express';
import chalk from 'chalk';
import { fairysMockerBase } from './base.js';
import { detect } from 'detect-port';

export class FairysMockerExpress {
  base = fairysMockerBase;
  /**创建 app*/
  createApp = () => {
    return fairysMockerBase.initApp(express())
  }

  // 使用express
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
    if (!fairysMockerBase.app) {
      console.log(chalk.red('请先初始化 app'));
      return;
    }
    const app = fairysMockerBase.app
    const realPort = await this.detectPort(port);
    fairysMockerBase.server = app.listen(realPort, (...rest) => {
      fairysMockerBase.logServer(realPort as number);
      callback?.(...rest);
    });
    return fairysMockerBase.server
  }

  /**启动 app*/
  start = () => {
    this.createApp();
    this.listen();
  }
}

export const fairysMockerExpress = new FairysMockerExpress();

