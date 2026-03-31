import express from 'express';
import fs from 'node:fs';
import nodePath from "node:path"
import createMockData from '@fairys/create-mock-data';
import { Get, Post, Controller } from "../utils/decorator.js"
import { utils } from "../utils/index.js"

/**路由*/
@Controller('/api')
export class MockRouter {
  @Post('/mock')
  post_mock(req: express.Request, res: express.Response) {
    // 定义接口
    try {
      const { mockList, dir, fileName = 'index.mock', rootDir } = req.body;
      let _rootDir = rootDir ?? utils.rootDir;
      if (rootDir && !fs.existsSync(rootDir)) {
        _rootDir = utils.rootDir;
      }

      const processedList = createMockData(mockList)
      // 存储到本地文件
      const safeSavePath = dir.trim() ?? 'mock';
      const safeSaveFileName = fileName.trim() ?? 'index.mock';
      const mockerDir = nodePath.join(_rootDir, safeSavePath);
      if (!fs.existsSync(mockerDir)) {
        fs.mkdirSync(mockerDir, { recursive: true });
      }
      const mockFilePath = nodePath.join(mockerDir, `${safeSaveFileName}.ts`);
      const mockFileContent = `// Mock 配置文件
// 自动生成于 ${new Date().toISOString()}
    
export interface MockerItem {
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
      const cacheFileContent = JSON.stringify({
        mockList,
        rootDir: utils.rootDir,
        dir: safeSavePath,
        fileName: safeSaveFileName,
        cache: safeSaveFileName + '.cache.json',
      }, null, 2);
      fs.writeFileSync(cacheFilePath, cacheFileContent);
      res.json({
        code: 200,
        message: 'Mock 配置保存成功',
        data: processedList,
        rootDir: utils.rootDir,
        dir: safeSavePath,
        cache: safeSaveFileName + '.cache.json',
        fileName: safeSaveFileName,
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
      const savePath = (req.query.dir as string)?.trim() ?? utils.dir;
      const saveFileName = (req.query.fileName as string)?.trim() ?? utils.file;
      const rootDir = (req.query.rootDir as string)?.trim() ?? utils.rootDir;

      // 读取 .cache.json 文件
      const mockerDir = nodePath.join(rootDir, savePath);
      const cacheFilePath = nodePath.join(mockerDir, saveFileName + '.cache.json');
      if (fs.existsSync(cacheFilePath)) {
        const cacheFileContent = fs.readFileSync(cacheFilePath, 'utf-8');
        const cacheData = JSON.parse(cacheFileContent);
        const mockList = cacheData.mockList || cacheData;
        res.json({
          code: 200,
          message: '读取 Mock 配置成功',
          data: mockList,
          rootDir: rootDir,
          dir: savePath,
          cache: saveFileName + '.cache.json',
          fileName: saveFileName,
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

  @Post('/proxy')
  post_proxy(req: express.Request, res: express.Response) {
    try {
      const { proxyList, dir, fileName = 'proxy', rootDir } = req.body;
      let _rootDir = rootDir ?? utils.rootDir;
      if (rootDir && !fs.existsSync(rootDir)) {
        _rootDir = utils.rootDir;
      }

      // 存储到本地文件
      const safeSavePath = dir.trim() ?? 'mock';
      const safeSaveFileName = fileName.trim() ?? 'proxy';
      const mockerDir = nodePath.join(_rootDir, safeSavePath);
      if (!fs.existsSync(mockerDir)) {
        fs.mkdirSync(mockerDir, { recursive: true });
      }
      const proxyFilePath = nodePath.join(mockerDir, `${safeSaveFileName}.ts`);
      const proxyFileContent = `// 代理配置文件
// 自动生成于 ${new Date().toISOString()}

/**
 * 代理配置参数
 */
export type ProxyItem = Record<string, string | {
  /**转发地址*/
  target: string,
  /**路径重写*/
  pathRewrite?: Record<string, string>,
  /**是否开启ws*/
  ws?: boolean
}> 

export const proxyList: ProxyItem = ${JSON.stringify(proxyList, null, 2)};
export default proxyList;
    `;
      fs.writeFileSync(proxyFilePath, proxyFileContent);
      // 存储原始的 proxyConfig 到 .cache.json 文件
      const cacheFilePath = nodePath.join(mockerDir, safeSaveFileName + '.cache.json');
      const cacheFileContent = JSON.stringify({
        proxyList,
        rootDir: utils.rootDir,
        dir: safeSavePath,
        fileName: safeSaveFileName,
        cache: safeSaveFileName + '.cache.json',
      }, null, 2);
      fs.writeFileSync(cacheFilePath, cacheFileContent);
      res.json({
        code: 200,
        message: '代理配置保存成功',
        data: proxyList,
        rootDir: utils.rootDir,
        dir: safeSavePath,
        cache: safeSaveFileName + '.cache.json',
        fileName: safeSaveFileName,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: '保存代理配置失败',
        error: error.message
      });
    }
  }

  @Get('/proxy')
  get_proxy(req: express.Request, res: express.Response) {
    try {
      const savePath = (req.query.dir as string)?.trim() ?? utils.dir;
      const saveFileName = (req.query.fileName as string)?.trim() ?? 'proxy';
      const rootDir = (req.query.rootDir as string)?.trim() ?? utils.rootDir;

      // 读取 .cache.json 文件
      const mockerDir = nodePath.join(rootDir, savePath);
      const cacheFilePath = nodePath.join(mockerDir, saveFileName + '.cache.json');
      if (fs.existsSync(cacheFilePath)) {
        const cacheFileContent = fs.readFileSync(cacheFilePath, 'utf-8');
        const cacheData = JSON.parse(cacheFileContent);
        const proxyList = cacheData.proxyList || [];
        res.json({
          code: 200,
          message: '读取代理配置成功',
          data: proxyList,
          rootDir: rootDir,
          dir: savePath,
          cache: saveFileName + '.cache.json',
          fileName: saveFileName,
        });
      } else {
        res.json({
          code: 404,
          message: '代理配置文件不存在',
        });
      }
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: '读取代理配置失败',
        error: error.message
      });
    }
  }
}