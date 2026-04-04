import express from 'express';
import fs from 'node:fs';
import { Get, Post, Controller } from "../utils/decorator.js"
import { utils } from "../utils/index.js"
import { MockRouter } from "../router/mock.js"
import { BaseController } from "./base.js"
import { getMcokFile, createMockFile } from '../utils/mcok.proxy.js';
import chalk from 'chalk';

/**路由*/
@Controller('/_fairys')
export class MockRouterController extends BaseController {
  /**mock 路由器实例*/
  router: MockRouter | null = null;
  constructor() {
    super();
    this.router = new MockRouter();
  }

  /**保存 Mock 配置*/
  @Post('/_mock')
  post_mock(req: express.Request, res: express.Response) {
    // 定义接口
    try {
      const { mockList, dir, fileName = 'index.mock', rootDir } = req.body;
      let _rootDir = rootDir || utils.rootDir;
      if (rootDir && !fs.existsSync(rootDir)) {
        _rootDir = utils.rootDir;
      }
      const mockData = createMockFile(mockList, _rootDir, dir, fileName)
      if (mockData?.mockConfig) {
        if (this.router?.isEnabled) {
          this.router?.load(mockData.mockConfig);
        }
        res.json({
          code: 200,
          message: 'Mock 配置保存成功',
          data: mockData.mockConfig,
          mockList: mockList,
          rootDir: mockData.rootDir,
          dir: mockData.dir,
          cache: mockData.cache,
          fileName: mockData.fileName,
        });
      }

    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: '保存 Mock 配置失败',
        error: error.message
      });
    }
  }

  /**读取 Mock 配置*/
  @Get('/_mock')
  get_mock(req: express.Request, res: express.Response) {
    try {
      const savePath = (req.query?.dir as string)?.trim()
      const saveFileName = (req.query?.fileName as string)?.trim()
      const rootDir = (req.query?.rootDir as string)?.trim()
      const mockData = getMcokFile(rootDir, savePath, saveFileName);
      if (mockData?.mockList) {
        res.json({
          code: 200,
          message: '读取 Mock 配置成功',
          data: mockData.mockList,
          rootDir: mockData.rootDir,
          dir: mockData.dir,
          cache: mockData.cache,
          fileName: mockData.fileName,
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

  /**检查 Mock 配置服务是否启用*/
  @Get('/_mock/_is_enabled')
  get_mock_enabled(req: express.Request, res: express.Response) {
    res.json({
      code: 200,
      message: 'Mock 配置服务是否启用',
      data: this.router?.isEnabled,
    });
  }

  /**启动 Mock 配置服务*/
  @Get('/_mock/_start')
  get_mock_start(req: express.Request, res: express.Response) {
    try {
      const mockData = getMcokFile(req.query.rootDir as string, req.query.dir as string, req.query.fileName as string);
      if (mockData?.mockList) {
        this.router?.load(mockData.mockList);
        res.json({
          code: 200,
          message: '启动 Mock 配置服务成功',
          data: mockData.mockList,
          rootDir: mockData.rootDir,
          dir: mockData.dir,
          cache: mockData.cache,
          fileName: mockData.fileName,
          isEnabled: true,
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
        message: '启动 Mock 配置失败',
        error: error.message
      });
    }
  }

  /**销毁 Mock 配置服务*/
  @Get('/_mock/_destroy')
  get_mock_destroy(req: express.Request, res: express.Response) {
    try {
      if (this.router?.router) {
        this.router?.destroy("销毁mock路由器实例");
      } else {
        res.json({
          code: 404,
          message: 'Mock 配置服务不存在',
        });
      }
      res.json({
        code: 200,
        message: '销毁 Mock 配置服务成功',
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        message: '销毁 Mock 配置服务',
        error: error.message
      });
    }
  }

  /**启动 Mock 配置服务*/
  start = (rootDir?: string, dir?: string, fileName?: string) => {
    try {
      const mockData = getMcokFile(rootDir, dir, fileName);
      if (mockData?.mockList) {
        try {
          this.router?.load(mockData.mockList);
          console.log(chalk.green(`启动 Mock 配置服务成功，配置文件：${mockData.rootDir}/${mockData.dir}/${mockData.fileName}.ts`))
          console.log('')
        } catch (error) {
          console.log(chalk.red(`启动 Mock 配置服务失败，配置文件：${mockData.rootDir}/${mockData.dir}/${mockData.fileName}.ts`))
          console.log('')
        }
      }
    } catch (error) {
      console.log(chalk.red(`启动 Mock 配置服务失败`))
      console.log('')
    }
  }
}
