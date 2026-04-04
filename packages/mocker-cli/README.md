# mocker-cli

用于界面配置生成mock数据和mock服务

[ ] 直接当 mock 服务
[ ] 生成 mock 数据
[ ] 服务 + 数据

## 安装

```bash
npm install @fairys/mocker-cli -D # pnpm install @fairys/mocker-cli -D # yarn add @fairys/mocker-cli -D
```

## 参数

```bash
Usage:
  $ fairys-mocker

Options:
  --root        设置根目录路径(默认取环境变量中的`FAIRYS_MOCKER_ROOT_DIR`)
  --dir         设置目录名(默认取环境变量中的`FAIRYS_MOCKER_DIR`)
  --file        设置文件名(默认取环境变量中的`FAIRYS_MOCKER_FILE`)
  --file2       设置文件名2(默认取环境变量中的`FAIRYS_MOCKER_PROXY_FILE`)
```

**参数说明**

`FAIRYS_MOCKER_ROOT_DIR`或`root`：未设置时，取当前执行命令目录
`FAIRYS_MOCKER_DIR`或者`dir`：未设置时，取当前执行命令目录的`mock`文件夹
`FAIRYS_MOCKER_FILE`或者`file`：未设置时，取当前执行命令目录的`mock`文件夹下的`index.mock.ts`文件
`FAIRYS_MOCKER_PROXY_FILE`或者`file2`：未设置时，取当前执行命令目录的`mock`文件夹下的`proxy.mock.ts`文件

