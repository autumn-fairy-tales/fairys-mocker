
import express from 'express';
import fs from 'node:fs';
import cors from "cors"
import { detect } from "detect-port"
import nodePath from "node:path";
import { fileURLToPath } from "node:url";
import { MockRouterController } from "./controller/mock.router.js"
import { registerRoutes, ClassStruct } from "./utils/decorator.js"
import { ProxyRouterController } from "./controller/proxy.router.js"
import chalk from "chalk"

// 转换成 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

export class MainAppCli {
  /**应用实例*/
  app: express.Express | null = null
  /**类*/
  controller: ClassStruct[] = [MockRouterController, ProxyRouterController];
  /**主路由*/
  router: express.Router | null = null;
  /**初始化 app*/
  init = () => {
    this.app = express();
    this.app.use(express.json());
    this.app.use(cors());
    this.router = express.Router();
    // 静态文件服务
    const staticDir = nodePath.join(__dirname, '../public');
    if (fs.existsSync(staticDir)) {
      this.app.use(express.static(staticDir));
      // console.log(chalk.green(`静态文件服务：${staticDir}`))
    }
    for (let index = 0; index < this.controller.length; index++) {
      const Controller = this.controller[index];
      registerRoutes(new Controller())
    }
    this.app.use('/', this.router);
  }
  /**启动 app*/
  start = () => {
    if (!this.app) {
      console.log(chalk.red('请先初始化 app'));
      return;
    }
    const app = this.app
    /**启动服务器*/
    const PORT = process.env.PORT || 6901;
    detect(PORT)
      .then(realPort => {
        app.listen(realPort, () => {
          console.log("")
          console.log(chalk.green(`\tAPI地址:    http://localhost:${realPort}`));
          console.log(chalk.green(`\tUI地址:     http://localhost:${realPort}/ui`));
          console.log("")
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
}

export const mainAppCli = new MainAppCli();

