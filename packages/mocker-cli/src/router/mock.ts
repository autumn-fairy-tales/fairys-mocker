import express from 'express';
import { MockerItem, createMockItemData } from "@fairys/create-mock-data"
import { BaseRouter } from "./base.js"

/**mock 路由器实例*/
export class MockRouter extends BaseRouter<MockerItem> {
  /**mock 路由器实例*/
  router: express.Router | null = null;

  /**加载mock路由*/
  load = (mockList: MockerItem[]) => {
    /**销毁路由器实例*/
    this.destroy();
    /**创建路由器实例*/
    const router = this.router = express.Router();
    /**加载mock路由*/
    for (let index = 0; index < mockList.length; index++) {
      const mockItem = mockList[index];
      /**加载mock路由*/
      const method = mockItem.method.toLowerCase() as "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "options";
      const handler = (req: express.Request, res: express.Response) => {
        console.log(`请求: ${method} ${mockItem.url}`)
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
      console.log(`加载: ${method} ${mockItem.url}`)
      router[method](mockItem.url, handler);
    }
  }
}