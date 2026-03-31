import express from 'express';
import fs from 'node:fs';
import nodePath from "node:path"
import createMockData from '@fairys/create-mock-data';
import { Get, Post, Controller } from "../utils/decorator.js"

/**路由*/
@Controller('/api')
export class MockRouter {
  @Post('/mock')
  post_mock(req: express.Request, res: express.Response) {
    // 定义接口
    try {
      const { mockList, savePath, saveFileName = 'index.mock' } = req.body;
      const processedList = createMockData(mockList)
      // 存储到本地文件
      const safeSavePath = savePath.trim() ?? 'mock';
      const safeSaveFileName = saveFileName.trim() ?? 'index.mock';
      const mockerDir = nodePath.join(process.cwd(), safeSavePath);
      if (!fs.existsSync(mockerDir)) {
        fs.mkdirSync(mockerDir, { recursive: true });
      }
      const mockFilePath = nodePath.join(mockerDir, `${safeSaveFileName}.ts`);
      const mockFileContent = `// Mock 配置文件
// 自动生成于 ${new Date().toISOString()}
    
interface MockerItem {
  /**该接口允许的 请求方法，默认同时支持 GET 和 POST*/
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /**状态码*/
  status: string;
  //配置响应延迟时间, 如果传入的是一个数组，则代表延迟时间的范围
  delay: number | [number, number];
  /**响应体(可以自定义返回格式)*/
  body: any;
  /**接口地址*/
  url: string;
  /**响应体格式类型*/
  bodyFormat: 'object' | 'list';
  /**列表数据条数（仅 list 格式有效）*/
  listCount?: number;
}

/**mock配置 列表*/
export type DefineMockList = MockerItem[];

export const mockList: DefineMockList = ${JSON.stringify(processedList, null, 2)};
export default mockList;
    `;
      fs.writeFileSync(mockFilePath, mockFileContent);
      // 存储原始的 mockList 和 savePath 到 .cache.json 文件
      const cacheFilePath = nodePath.join(mockerDir, safeSaveFileName + '.cache.json');
      const cacheFileContent = JSON.stringify({ mockList, savePath: safeSavePath, saveFileName: safeSaveFileName }, null, 2);
      fs.writeFileSync(cacheFilePath, cacheFileContent);

      res.json({
        code: 200,
        message: 'Mock 配置保存成功',
        data: processedList,
        filePath: mockFilePath,
        cachePath: cacheFilePath,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: '保存 Mock 配置失败',
        error: error.message
      });
    }
  }

  @Get('/mock')
  get_mock(req: express.Request, res: express.Response) {
    try {
      const savePath = (req.query.savePath as string)?.trim() ?? 'mock';
      const saveFileName = (req.query.saveFileName as string)?.trim() ?? 'index.mock';
      // 读取 .cache.json 文件
      const mockerDir = nodePath.join(process.cwd(), savePath);
      const cacheFilePath = nodePath.join(mockerDir, saveFileName + '.cache.json');
      if (fs.existsSync(cacheFilePath)) {
        const cacheFileContent = fs.readFileSync(cacheFilePath, 'utf-8');
        const cacheData = JSON.parse(cacheFileContent);
        const mockList = cacheData.mockList || cacheData;
        const savedSavePath = cacheData.savePath || savePath;
        const savedSaveFileName = cacheData.saveFileName || saveFileName;
        res.json({
          code: 200,
          message: '读取 Mock 配置成功',
          data: mockList,
          savePath: savedSavePath,
          cachePath: cacheFilePath,
          saveFileName: savedSaveFileName,
        });
      } else {
        res.json({
          code: 404,
          message: 'Mock 配置文件不存在',
        });
      }
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: '读取 Mock 配置失败',
        error: error.message
      });
    }
  }
}