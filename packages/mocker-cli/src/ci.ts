import { fairysMockerExpress } from "./app/main.js"
import { fairysMockerConnect } from "./app/connect.js"

export const runExpressCli = () => {
  // 1. 直接当 mock 服务，
  // 2. 生成 mock 数据
  // 3. mock 服务 + 数据
  fairysMockerExpress.start();
}

export const runConnectCli = () => {
  fairysMockerConnect.start();

};