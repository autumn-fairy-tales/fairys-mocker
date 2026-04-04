import express from 'express';
import { ProxyItem } from "@fairys/create-mock-data"
import { BaseRouter } from "./base.js"
import { createProxyMiddleware, RequestHandler } from "http-proxy-middleware"
import chalk from "chalk"
import { fairysMockerBase } from "../base.js"
import { utilsGlobalVariable } from "../utils/utils.js"

/**代理 路由器实例*/
export class ProxyRouter extends BaseRouter<ProxyItem> {
  /**代理 路由器实例*/
  router: express.Router | null = null;
  wsProxyList: RequestHandler[] = []
  /**加载代理路由*/
  load = (proxyList: ProxyItem[]) => {
    const _that = this;
    this.destroy();
    /**创建路由器实例*/
    const router = this.router = express.Router();
    this.isEnabled = true;

    for (let index = 0; index < proxyList.length; index++) {
      const proxyItem = proxyList[index];
      let protocol = 'http';
      let _target = proxyItem.target
      let _path = new RegExp(proxyItem.path)

      if (/^(http:|https:|ws:|wss:)/.test(proxyItem.target)) {
        const [_protocol] = proxyItem.target.split(":")
        protocol = _protocol;
      }
      if ((protocol !== 'ws' && protocol !== 'wss') && proxyItem.ws) {
        protocol = 'ws'
        const [_protocol, ...rest] = proxyItem.target.split(":")
        _target = [protocol, ...rest].join(":")
      }
      console.log(chalk.hex('#AF52DE')(chalk.bold(`  🍇 proxy代理启动:\t${chalk.yellow(protocol)}\t${proxyItem.path} ===> ${_target}\t`)))
      // 判断是否 ^ 开头
      if (!proxyItem.path.startsWith('^')) {
        _path = new RegExp('^' + proxyItem.path)
      }
      if (proxyItem.ws) {
        if (utilsGlobalVariable.isEnableWebsocket) {
          const wsProxy = createProxyMiddleware({
            target: proxyItem.target,
            pathRewrite: proxyItem.pathRewrite,
            ws: proxyItem.ws,
            changeOrigin: true,
          })
          _that.wsProxyList.push(wsProxy)
          router.all(_path, wsProxy)
          if (fairysMockerBase.server) {
            // 升级 WebSocket 处理
            fairysMockerBase.server?.on('upgrade', wsProxy.upgrade)
          }
        } else {
          console.log(chalk.red(`rsbuild/vite等自带websocket服务的环境下无法代理websocket服务：${proxyItem.path}`))
        }
      } else {
        // 这个不生效问题
        router.all(_path, createProxyMiddleware({
          target: proxyItem.target,
          pathRewrite: proxyItem.pathRewrite,
          ws: proxyItem.ws,
          changeOrigin: true,
        }))
      }
    }
    console.log('')
    this.useRouter();
  }

  /**销毁路由器实例*/
  destroy: (msg?: string) => void = (msg) => {
    if (this.router) {
      // 清空路由器实例
      this.router.stack = [];
      this.isEnabled = false;
    }
    /** http 升级 WebSocket 的 upgrade 销毁*/
    const wsProxyList = this.wsProxyList
    if (Array.isArray(wsProxyList) && wsProxyList.length && fairysMockerBase.server) {
      for (let index = 0; index < wsProxyList.length; index++) {
        const wsProxy = wsProxyList[index];
        fairysMockerBase.server.off('upgrade', wsProxy.upgrade)
      }
    }
    if (msg) {
      console.log(chalk.red(msg))
    }
    console.log('')
  };
}