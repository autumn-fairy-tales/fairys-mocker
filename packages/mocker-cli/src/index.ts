
import express from 'express';
import fs from 'node:fs';
import cors from "cors"
import { detect } from "detect-port"
import nodePath from "node:path";
import { fileURLToPath } from "node:url";
import { MockRouter } from "./router/mock.router.js"
import { registerRoutes, ClassStruct } from "./utils/decorator.js"

// 转换成 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

class MockerCli {

  app: express.Express
  /**类*/
  controller: ClassStruct[] = [MockRouter];

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(cors());
    // 静态文件服务
    const staticDir = nodePath.join(__dirname, '../public');
    if (fs.existsSync(staticDir)) {
      this.app.use(express.static(staticDir));
      console.log(`静态文件服务：${staticDir}`);
    }
    for (let index = 0; index < this.controller.length; index++) {
      const Controller = this.controller[index];
      registerRoutes(new Controller(), this.app)
    }
  }

  start = () => {
    const app = this.app
    /**启动服务器*/
    const PORT = process.env.PORT || 6901;
    detect(PORT)
      .then(realPort => {
        app.listen(realPort, () => {
          console.log("")
          console.log(` \x1B[32mAPI地址:    http://localhost:${realPort}\x1B[0m`);
          console.log(` \x1B[32mUI地址:     http://localhost:${realPort}/ui\x1B[0m`);
          console.log("")
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
}

export const runCli = () => {
  // 1. 直接当 mock 服务，
  // 2. 生成 mock 数据
  // 3. mock 服务 + 数据
  const mockerCli = new MockerCli();

  mockerCli.start();

}