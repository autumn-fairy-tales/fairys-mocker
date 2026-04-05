
import express from 'express';
import connect from 'connect';
import fs from 'node:fs';
import cors from "cors"
import nodePath from "node:path";
import { fileURLToPath } from "node:url";
import { MockRouterController } from "./controller/mock.router.js"
import { ClassStruct, registerRoutes } from "./utils/decorator.js"
import { ProxyRouterController } from "./controller/proxy.router.js"
import chalk from "chalk"
import http from "node:http";

// 转换成 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);


export interface FairysMockerBaseCallBackOptions {
  /**注册路由之前*/
  beforeRouter?: (app: express.Express, mainApp: express.Express | connect.Server, instance: FairysMockerBase) => void;
  /**注册路由之后*/
  afterRouter?: (app: express.Express, mainApp: express.Express | connect.Server, instance: FairysMockerBase) => void;
  /**注册静态文件服务之前*/
  beforeStaticServer?: (app: express.Express, mainApp: express.Express | connect.Server, instance: FairysMockerBase) => void;
  /**注册静态文件服务之后*/
  afterStaticServer?: (app: express.Express, mainApp: express.Express | connect.Server, instance: FairysMockerBase) => void;
  /**注册mock和代理路由接口之前*/
  beforeRegisterMockProxyRoutes?: (app: express.Express, mainApp: express.Express | connect.Server, instance: FairysMockerBase) => void;
  /**注册mock和代理路由接口之后*/
  afterRegisterMockProxyRoutes?: (app: express.Express, mainApp: express.Express | connect.Server, instance: FairysMockerBase) => void;
  /**最后*/
  last?: (app: express.Express, mainApp: express.Express | connect.Server, instance: FairysMockerBase) => void;
}

export class FairysMockerBase {
  /**服务*/
  server: http.Server | undefined = undefined
  /**主路由*/
  router: express.Router | undefined = undefined;
  /**内置路由*/
  fairysMockerRouter: express.Router | undefined = undefined;
  /**子应用*/
  app: express.Express | undefined = undefined;
  /**主应用*/
  mainApp: express.Express | connect.Server | undefined = undefined;
  /**类*/
  controller: ClassStruct[] = [MockRouterController, ProxyRouterController];
  /**静态文件服务列表*/
  staticServerList: string[] = [];

  /**静态文件服务*/
  staticServer = (dir: string, prefix: string = '/', isRegister: boolean = true) => {
    if (!this.app) {
      return;
    }
    if (fs.existsSync(dir)) {
      let _prefix = prefix;
      if (!/^\//.test(prefix)) {
        _prefix = "/" + prefix
      }
      this.app.use(_prefix, express.static(dir));
      // console.log(chalk.green(`静态文件服务：${_prefix}\t${dir}`))
      if (isRegister) {
        this.staticServerList.push(_prefix)
      }
    } else {
      console.log(chalk.red(`${dir} 目录不存在`))
    }
  }

  /**初始化 app 服务*/
  initApp = (app: express.Express | connect.Server, options?: FairysMockerBaseCallBackOptions): express.Express | connect.Server => {
    if (!this.app) {
      console.log('')
      console.log(chalk.hex('#54FF9F')('=================fairys-mocker================='))
      console.log('')

      this.mainApp = app
      this.app = express();
      // 挂子应用
      this.mainApp.use(this.app)

      this.app.use(express.json());
      this.app.use(cors());

      options?.beforeRouter?.(this.app, this.mainApp, this)

      /**注册主路由*/
      this.router = express.Router();
      /**注册内置路由*/
      this.fairysMockerRouter = express.Router();
      this.router.use(this.fairysMockerRouter);

      options?.afterRouter?.(this.app, this.mainApp, this)

      options?.beforeStaticServer?.(this.app, this.mainApp, this)

      // 静态文件服务
      const staticDir = nodePath.join(__dirname, '../public/_fairys_mocker');
      this.staticServer(staticDir, '/_fairys_mocker', false);

      options?.afterStaticServer?.(this.app, this.mainApp, this)
      options?.beforeRegisterMockProxyRoutes?.(this.app, this.mainApp, this)

      for (let index = 0; index < this.controller.length; index++) {
        const Controller = this.controller[index];
        const newController = new Controller();
        registerRoutes(newController)
        // @ts-ignore
        const start = newController?.start;
        if (typeof start === 'function') {
          start()
        }
      }

      options?.afterRegisterMockProxyRoutes?.(this.app, this.mainApp, this)

      this.app.use('/', this.router);

      options?.last?.(this.app, this.mainApp, this)

      console.log('')

    } else {
      console.log('挂载 主应用 服务')
      this.mainApp = app
      this.mainApp.use(this.app)
    }
    return app;
  }

  /**启动日志打印服务器地址*/
  logServer = async (port: number) => {
    if (!this.app) {
      console.log(chalk.red('请先初始化 app'));
      return;
    }
    console.log("")
    console.log(chalk.green(`\tfairys-mocker API地址:    http://localhost:${port}`));
    console.log(chalk.green(`\tfairys-mocker UI地址:     http://localhost:${port}/_fairys_mocker`));
    console.log("")
    for (let index = 0; index < this.staticServerList.length; index++) {
      const element = this.staticServerList[index];
      console.log(chalk.green(`\tfairys-mocker 静态服务 ${chalk.yellow(element)} 地址:     http://localhost:${port}${element}`));
    }
    console.log("")
  }

  close = () => {
    if (this.server) {
      this.server.close();
    }
  }
}

export const fairysMockerBase = new FairysMockerBase();

