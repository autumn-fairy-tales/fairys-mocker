import parser, { Arguments } from 'yargs-parser'
import { fairysMockerExpress, FairysMockerExpress } from "./main.js"
import { fairysMockerConnect, FairysMockerConnect } from "./connect.js"
import { utilsGlobalVariable } from "./utils/utils.js"

function help() {
  console.log('\n  Usage: \x1b[34;1fairys-mocker\x1b[0m [--help|h|--root|--dir|--file|--file2|--static|--static-prefix|--is-mock-file|--is-proxy-file]');
  console.log('\n  Displays help information.');
  console.log('\n  Options:\n');
  console.log('   --root                   ', '设置根目录路径(默认取环境变量中的`FAIRYS_MOCKER_ROOT_DIR`).');
  console.log('   --dir                    ', '设置目录名(默认取环境变量中的`FAIRYS_MOCKER_DIR`).');
  console.log('   --file                   ', '设置文件名(默认取环境变量中的`FAIRYS_MOCKER_FILE`).');
  console.log('   --file2                  ', '设置文件名2(默认取环境变量中的`FAIRYS_MOCKER_PROXY_FILE`).');
  console.log('   --static                 ', '设置静态文件服务目录.');
  console.log('   --static-prefix          ', '设置静态文件服务目录访问前缀.');
  console.log('   --is-mock-file           ', '是否生成mock数据文件,默认生成.');
  console.log('   --is-proxy-file          ', '是否生成proxy数据文件,默认生成.');
  console.log('   --is-connect             ', '是否是connect服务.默认express.');

  console.log('\n  Example:\n');
  console.log('   $ \x1b[35mfairys-mocker\x1b[0m --dir mock2');
  console.log('   $ \x1b[35mfairys-mocker\x1b[0m --file index.mock');
}

const argv: Partial<Arguments> = parser(process.argv.slice(2), {
  string: ["root", 'dir', 'file', 'file2', 'static', 'static-prefix'],
  boolean: ['is-mock-file', "is-proxy-file", 'is-connect']
})

export const CI = (app: FairysMockerExpress | FairysMockerConnect) => {
  if (argv.help | argv.h) {
    help();
    return;
  } else {
    utilsGlobalVariable.setRootDir(argv.root);
    utilsGlobalVariable.setDir(argv.dir);
    utilsGlobalVariable.setFile(argv.file);
    utilsGlobalVariable.setProxyFile(argv.file2);
    utilsGlobalVariable.setIsCreateMockDataFile(argv['is-mock-file'])
    utilsGlobalVariable.setIsCreateProxyDataFile(argv['is-proxy-file'])
    // 1. 直接当 mock 服务，
    // 2. 生成 mock 数据
    // 3. mock 服务 + 数据
    app.start({
      afterStaticServer: () => {
        if (!argv.static) {
          return;
        }
        app.staticServer(argv.static, argv['static-prefix']);
      }
    });
  }
}

export const runCli = () => {
  if (argv['is-connect']) {
    CI(fairysMockerConnect)
  } else {
    CI(fairysMockerExpress)
  }
}
