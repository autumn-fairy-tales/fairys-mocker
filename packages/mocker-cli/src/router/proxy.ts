import express from 'express';
import { ProxyItem } from "@fairys/create-mock-data"
import { BaseRouter } from "./base.js"
import { createProxyMiddleware } from "http-proxy-middleware"
import chalk from "chalk"

/**代理 路由器实例*/
export class ProxyRouter extends BaseRouter<ProxyItem> {
  /**代理 路由器实例*/
  router: express.Router | null = null;

  /**加载代理路由*/
  load = (proxyList: ProxyItem[]) => {
    this.destroy();
    /**创建路由器实例*/
    const router = this.router = express.Router();
    this.isEnabled = true;
    for (let index = 0; index < proxyList.length; index++) {
      const proxyItem = proxyList[index];
      console.log(chalk.hex('#AF52DE')(chalk.bold(`🍇 proxy代理启动:\t${proxyItem.path} ===> ${proxyItem.target}\t`)))
      // 判断是否 ^ 开头
      if (!proxyItem.path.startsWith('^')) {
        proxyItem.path = '^' + proxyItem.path;
      }
      router.use(proxyItem.path, createProxyMiddleware({
        target: proxyItem.target,
        pathRewrite: proxyItem.pathRewrite,
        ws: proxyItem.ws,
        changeOrigin: true,
      }))
    }
    console.log('')

    this.useRouter();
  }
}