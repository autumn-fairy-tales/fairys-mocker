
import express from 'express';
import fs from 'node:fs';
import cors from "cors"
import nodePath from "node:path";
import { fileURLToPath } from "node:url";
import { MockRouterController } from "./controller/mock.router.js"
import { ClassStruct, registerRoutes } from "./utils/decorator.js"
import { ProxyRouterController } from "./controller/proxy.router.js"
import chalk from "chalk"
import * as http from "http";

// 转换成 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

export class FairysMockerBase {
  /**服务*/
  server: http.Server | undefined = undefined
  /**主路由*/
  router: express.Router | undefined = undefined;
  /**应用*/
  app: express.Express | undefined = undefined;
  /**类*/
  controller: ClassStruct[] = [MockRouterController, ProxyRouterController];
  /**初始化 app 服务*/
  initApp = (app: express.Express) => {
    this.app = app;
    app.use(express.json());
    app.use(cors());

    /**注册主路由*/
    this.router = express.Router();
    this.app.use(this.router);

    // 静态文件服务
    const staticDir = nodePath.join(__dirname, '../public');
    if (fs.existsSync(staticDir)) {
      app.use(express.static(staticDir));
      // console.log(chalk.green(`静态文件服务：${staticDir}`))
    }

    for (let index = 0; index < this.controller.length; index++) {
      const Controller = this.controller[index];
      registerRoutes(new Controller())
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
  }
}

export const fairysMockerBase = new FairysMockerBase();

