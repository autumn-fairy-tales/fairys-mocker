
import chalk from 'chalk';
import fs from 'node:fs';
import path from "node:path"

class Utils {
  /**根目录*/
  public rootDir = process.cwd();
  /**目录名*/
  public dir = 'mock';
  /**文件名*/
  public file = 'index.mock';
  /**代理文件名*/
  public proxyFile = 'proxy';
  /**是否生成mock数据文件*/
  public isCreateMockDataFile = true;
  /**是否生成proxy数据文件*/
  public isCreateProxyDataFile = true;

  /**设置根目录*/
  setRootDir = (value?: string) => {
    if (value && fs.existsSync(value)) {
      this.rootDir = value
    } else {
      if (value) {
        console.log('')
        console.log(chalk.red(`设置的根目录不存在：${value}`))
        console.log('')
      }
      this.rootDir = process.env.FAIRYS_MOCKER_ROOT_DIR || path.join(process.cwd());
    }
  }

  /**设置目录名*/
  setDir = (value?: string) => {
    this.dir = value || process.env.FAIRYS_MOCKER_DIR || 'mock';
  }

  /**设置文件名*/
  setFile = (value?: string) => {
    this.file = value || process.env.FAIRYS_MOCKER_FILE || 'index.mock';
  }

  /**设置代理文件名*/
  setProxyFile = (value?: string) => {
    this.proxyFile = value || process.env.FAIRYS_MOCKER_PROXY_FILE || 'proxy';
  }

  /**设置 是否生成mock数据文件*/
  setIsCreateMockDataFile = (fig?: boolean) => {
    if (typeof fig === "boolean") {
      this.isCreateMockDataFile = fig
    }
  }

  /**设置 是否生成proxy数据文件*/
  setIsCreateProxyDataFile = (fig?: boolean) => {
    if (typeof fig === "boolean") {
      this.isCreateProxyDataFile = fig
    }
  }

}

export const utils = new Utils()