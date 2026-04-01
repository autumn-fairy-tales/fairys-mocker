import express from 'express';
import { MockerItem, ProxyItem } from "@fairys/create-mock-data"
import { BaseRouter } from "./base.js"

/**代理 路由器实例*/
export class ProxyRouter extends BaseRouter<ProxyItem> {
  /**代理 路由器实例*/
  router: express.Router | null = null;

  /**加载代理路由*/
  load = (proxyList: ProxyItem[]) => {

  }

  /**销毁路由器实例*/
  destroy = () => {
    if (this.router) {
      // 清空路由器实例
      this.router.stack = [];
      this.router = null;
    }
  }
}