import { mainAppCli } from "./main.js"

export const runCli = () => {
  // 初始化 app
  mainAppCli.init();
  // 1. 直接当 mock 服务，
  // 2. 生成 mock 数据
  // 3. mock 服务 + 数据
  mainAppCli.start();
}