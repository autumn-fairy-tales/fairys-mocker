
import fs from 'node:fs';
import path from "node:path"

class Utils {
  /**根目录*/
  public rootDir = process.cwd();
  /**目录名*/
  public dir = 'mock';
  /**文件名*/
  public file = 'index.mock';

  /**设置根目录*/
  setRootDir = (value?: string) => {
    if (value && fs.existsSync(value)) {
      this.rootDir = value
    } else {
      if (value) {
        console.log('')
        console.log(` \x1B[31m设置的根目录不存在：${value}\x1B[0m`)
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
}

export const utils = new Utils()