import express from 'express';
import fs from 'node:fs';
import nodePath from "node:path"
import { createProxyData } from '@fairys/create-mock-data';
import { Get, Post, Controller } from "../utils/decorator.js"
import { utils } from "../utils/index.js"
import { ProxyRouter } from '../router/proxy.js';

/**路由*/
@Controller('/_fairys')
export class ProxyRouterController {
  /**代理 路由器实例*/
  router: ProxyRouter | null = null;

  @Post('/_proxy')
  post_proxy(req: express.Request, res: express.Response) {
    try {
      const { proxyList, dir, fileName = 'proxy', rootDir } = req.body;
      let _rootDir = rootDir || utils.rootDir;
      if (rootDir && !fs.existsSync(rootDir)) {
        _rootDir = utils.rootDir;
      }

      // 存储到本地文件
      const safeSavePath = dir.trim() || 'mock';
      const safeSaveFileName = fileName.trim() || 'proxy';
      const mockerDir = nodePath.join(_rootDir, safeSavePath);
      if (!fs.existsSync(mockerDir)) {
        fs.mkdirSync(mockerDir, { recursive: true });
      }

      const proxyConfig = createProxyData(proxyList)

      const proxyFilePath = nodePath.join(mockerDir, `${safeSaveFileName}.ts`);
      const proxyFileContent = `// 代理配置文件
// 自动生成于 ${new Date().toISOString()}

/**
 * 代理配置参数
 */
export type ProxyItem = Record<string,{
  /**转发地址*/
  target: string,
  /**路径重写*/
  pathRewrite?: Record<string, string>,
  /**是否开启ws*/
  ws?: boolean
}> 

export const proxyConfig: ProxyItem = ${JSON.stringify(proxyConfig, null, 2)};
export default proxyConfig;
    `;
      fs.writeFileSync(proxyFilePath, proxyFileContent);
      // 存储原始的 proxyConfig 到 .cache.json 文件
      const cacheFilePath = nodePath.join(mockerDir, safeSaveFileName + '.cache.json');
      const cacheFileContent = JSON.stringify({
        proxyList,
        rootDir: _rootDir,
        dir: safeSavePath,
        fileName: safeSaveFileName,
        cache: safeSaveFileName + '.cache.json',
      }, null, 2);
      fs.writeFileSync(cacheFilePath, cacheFileContent);
      res.json({
        code: 200,
        message: '代理配置保存成功',
        data: proxyConfig,
        proxyList: proxyList,
        rootDir: _rootDir,
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

  @Get('/_proxy')
  get_proxy(req: express.Request, res: express.Response) {
    try {
      const savePath = (req.query.dir as string)?.trim() || utils.dir;
      const saveFileName = (req.query.fileName as string)?.trim() || 'proxy';
      const rootDir = (req.query.rootDir as string)?.trim() || utils.rootDir;

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