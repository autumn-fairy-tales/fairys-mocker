import express from 'express';
import fs from 'node:fs';
import { Get, Post, Controller } from "../utils/decorator.js"
import { utilsGlobalVariable } from "../utils/utils.js"
import { ProxyRouter } from '../router/proxy.js';
import { BaseController } from './base.js';
import { getProxyFile, createProxyFile } from '../utils/mcok.proxy.js';
import chalk from 'chalk';

/**路由*/
@Controller('/_fairys')
export class ProxyRouterController extends BaseController {
  /**代理 路由器实例*/
  router: ProxyRouter | null = null;

  constructor() {
    super();
    this.router = new ProxyRouter();
  }

  @Post('/_proxy')
  post_proxy(req: express.Request, res: express.Response) {
    try {
      const { proxyList, dir, fileName = 'proxy', rootDir } = req.body;
      let _rootDir = rootDir || utilsGlobalVariable.rootDir;
      if (rootDir && !fs.existsSync(rootDir)) {
        _rootDir = utilsGlobalVariable.rootDir;
      }
      const proxyData = createProxyFile(proxyList, _rootDir, dir, fileName)
      if (proxyData?.proxyConfig) {
        if (this.router?.isEnabled) {
          this.router?.load(proxyList);
        }
        res.json({
          code: 200,
          message: '代理配置保存成功',
          data: proxyData.proxyConfig,
          proxyList: proxyList,
          rootDir: proxyData.rootDir,
          dir: proxyData.dir,
          cache: proxyData.cache,
          fileName: proxyData.fileName,
        });
      } else {
        res.json({
          code: 404,
          message: '生成配置文件错误',
        });
      }
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
      const savePath = (req.query.dir as string)?.trim()
      const saveFileName = (req.query.fileName as string)?.trim()
      const rootDir = (req.query.rootDir as string)?.trim()
      const proxyData = getProxyFile(rootDir, savePath, saveFileName);
      if (proxyData?.proxyList) {
        res.json({
          code: 200,
          message: '读取代理配置成功',
          data: proxyData.proxyList,
          rootDir: proxyData.rootDir,
          dir: proxyData.dir,
          cache: proxyData.cache,
          fileName: proxyData.fileName,
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

  /**检查代理服务是否启用*/
  @Get('/_proxy/_is_enabled')
  get_proxy_enabled(req: express.Request, res: express.Response) {
    res.json({
      code: 200,
      message: '代理服务是否启用',
      data: this.router?.isEnabled,
    });
  }

  /**启动代理服务*/
  @Get('/_proxy/_start')
  get_proxy_start(req: express.Request, res: express.Response) {
    try {
      const savePath = (req.query.dir as string)?.trim()
      const saveFileName = (req.query.fileName as string)?.trim();
      const rootDir = (req.query.rootDir as string)?.trim()
      const proxyData = getProxyFile(rootDir, savePath, saveFileName);
      if (proxyData?.proxyList) {
        this.router?.load(proxyData.proxyList);
        const msg = utilsGlobalVariable.isEnableWebsocket ? '启动代理服务成功' : '非websocket服务代理启动成功'
        res.json({
          code: 200,
          message: msg,
          data: proxyData.proxyList,
          rootDir: rootDir,
          dir: proxyData.dir,
          cache: proxyData.cache,
          fileName: proxyData.fileName,
          isEnabled: true,
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
        message: '启动代理配置失败',
        error: error.message
      });
    }
  }

  /**销毁代理服务*/
  @Get('/_proxy/_destroy')
  get_proxy_destroy(req: express.Request, res: express.Response) {
    try {
      if (this.router?.router) {
        this.router?.destroy("销毁proxy路由器实例");
      } else {
        res.json({
          code: 404,
          message: '代理服务不存在',
        });
      }
      res.json({
        code: 200,
        message: '销毁代理服务成功',
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: '销毁代理服务失败',
        error: error.message
      });
    }
  }

  start = (rootDir?: string, dir?: string, fileName?: string) => {
    try {
      const proxyData = getProxyFile(rootDir, dir, fileName);
      if (proxyData?.proxyList) {
        try {
          this.router?.load(proxyData.proxyList);
          console.log(chalk.green(`  启动代理服务成功，配置文件：${proxyData.rootDir}/${proxyData.dir}/${proxyData.fileName}.ts`))
          console.log('')
        } catch (error) {
          console.log(chalk.red(`  启动代理服务失败，配置文件：${proxyData.rootDir}/${proxyData.dir}/${proxyData.fileName}.ts`))
          console.log('')
        }
      }
    } catch (error) {
      console.log(chalk.red(`  启动代理服务失败`))
      console.log('')
    }
  }

}