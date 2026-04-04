import parser, { Arguments } from 'yargs-parser'
import { fairysMockerExpress } from "./main.js"
import { fairysMockerConnect } from "./connect.js"
import { utils } from "./utils/utils.js"

function help() {
  console.log('\n  Usage: \x1b[34;1fairys-mocker\x1b[0m [--help|h|--root|--dir|--file|--file2]');
  console.log('\n  Displays help information.');
  console.log('\n  Options:\n');
  console.log('   --root                  ', '设置根目录路径(默认取环境变量中的`FAIRYS_MOCKER_ROOT_DIR`).');
  console.log('   --dir                  ', '设置目录名(默认取环境变量中的`FAIRYS_MOCKER_DIR`).');
  console.log('   --file                  ', '设置文件名(默认取环境变量中的`FAIRYS_MOCKER_FILE`).');
  console.log('   --file2                  ', '设置文件名2(默认取环境变量中的`FAIRYS_MOCKER_PROXY_FILE`).');

  console.log('\n  Example:\n');
  console.log('   $ \x1b[35mfairys-mocker\x1b[0m --dir mock2');
  console.log('   $ \x1b[35mfairys-mocker\x1b[0m --file index.mock');
}

const argv: Partial<Arguments> = parser(process.argv.slice(2), {
  string: ["root", 'dir', 'file', 'file2'],
})

export const runExpressCli = () => {
  if (argv.help | argv.h) {
    help();
    return;
  } else {
    utils.setRootDir(argv.root);
    utils.setDir(argv.dir);
    utils.setFile(argv.file);
    utils.setProxyFile(argv.file2);
    // 1. 直接当 mock 服务，
    // 2. 生成 mock 数据
    // 3. mock 服务 + 数据
    fairysMockerExpress.start();
  }
}

export const runConnectCli = () => {
  if (argv.help) {
    help();
    return;
  } else {
    utils.setRootDir(argv.root);
    utils.setDir(argv.dir);
    utils.setFile(argv.file);
    utils.setProxyFile(argv.file2);
    fairysMockerConnect.start();
  }
};