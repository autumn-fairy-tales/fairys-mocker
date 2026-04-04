import express from 'express';
import { MockerItem, createMockItemData } from "@fairys/create-mock-data"
import { BaseRouter } from "./base.js"
import chalk from "chalk"
/**mock 路由器实例*/
export class MockRouter extends BaseRouter<MockerItem> {
  /**加载mock路由*/
  load = (mockList: MockerItem[]) => {
    /**销毁路由器实例*/
    this.destroy();
    /**创建路由器实例*/
    // const router = this.router = Router();
    const router = this.router = express.Router();
    this.isEnabled = true;
    /**加载mock路由*/
    for (let index = 0; index < mockList.length; index++) {
      const mockItem = mockList[index];
      /**加载mock路由*/
      const method = mockItem.method.toLowerCase() as "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "options";
      const handler = (req: express.Request, res: express.Response) => {
        console.log(chalk.cyan(`  🦄 mock请求:` + '\t' + chalk.yellow(`${method}`) + "\t" + chalk.bold(`${mockItem.url}`)))
        try {
          const mockData = createMockItemData(mockItem);
          res.status(Number(mockData.status) || 200).json(mockData.body);
        } catch (error) {
          res.status(500).json({
            code: 500,
            message: '加载失败',
          });
        }
      };
      console.log(chalk.green(`  🦄 mock加载:` + '\t' + chalk.yellow(`${method}`) + "\t" + chalk.bold(`${mockItem.url}`)))
      router[method](mockItem.url, handler);
    }
    console.log('')
    this.useRouter();
  }
}