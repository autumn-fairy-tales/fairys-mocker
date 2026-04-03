import { fairysMockerExpress } from "./main.js"

export const runCli = () => {
  // 1. 直接当 mock 服务，
  // 2. 生成 mock 数据
  // 3. mock 服务 + 数据
  fairysMockerExpress.start();
}