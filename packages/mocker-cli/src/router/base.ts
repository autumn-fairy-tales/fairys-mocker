import express from 'express';
import { fairysMockerBase } from "../base.js"
import chalk from 'chalk';


export class BaseRouter<T> {
  /**mock 路由器实例*/
  router: express.Router | null = null;
  /**服务是否启用*/
  isEnabled = false;
  /**加载*/
  load: (data: T[]) => void = (data) => {
    /**销毁路由器实例*/
    this.destroy();
  };

  /**销毁路由器实例*/
  destroy: (msg?: string) => void = (msg) => {
    if (this.router) {
      // 清空路由器实例
      this.router.stack = [];
      this.isEnabled = false;
    }
    if (msg) {
      console.log(chalk.red(msg))
      console.log('')
    }
  };

  useRouter() {
    if (this.router && fairysMockerBase.router) {
      fairysMockerBase.router.use(this.router);
    }
  }

}