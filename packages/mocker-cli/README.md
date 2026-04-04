# mocker-cli

功能强大的 Mock 数据生成和代理转发工具

## 安装

```bash
npm install @fairys/mocker-cli -D # pnpm install @fairys/mocker-cli -D # yarn add @fairys/mocker-cli -D
```

## 参数

```bash
Usage:
  $ fairys-mocker

Options:
  --root            设置根目录路径(默认取环境变量中的`FAIRYS_MOCKER_ROOT_DIR`)
  --dir             设置目录名(默认取环境变量中的`FAIRYS_MOCKER_DIR`)
  --file            设置文件名(默认取环境变量中的`FAIRYS_MOCKER_FILE`)
  --file2           设置文件名2(默认取环境变量中的`FAIRYS_MOCKER_PROXY_FILE`)
  --static          设置静态文件目录
  --static-prefix   设置静态文件路径前缀
  --is-mock-file    是否生成mock数据文件,默认生成.
  --is-proxy-file   是否生成proxy数据文件,默认生成.
  --is-connect      是否是connect服务.默认express.
```

**参数说明**

- `FAIRYS_MOCKER_ROOT_DIR`或`root`：未设置时，取当前执行命令目录
- `FAIRYS_MOCKER_DIR`或者`dir`：未设置时，取当前执行命令目录的`mock`文件夹
- `FAIRYS_MOCKER_FILE`或者`file`：未设置时，取当前执行命令目录的`mock`文件夹下的`index.mock.cache.json`文件
- `FAIRYS_MOCKER_PROXY_FILE`或者`file2`：未设置时，取当前执行命令目录的`mock`文件夹下的`proxy.cache.json`文件

:::tip

`file`和`file2`值为移除`.cache.json`的文件名，不是完整的文件名,

例如`file=index.mock`, `file2=proxy` 内部会进行转换为 `index.mock.cache.json`、`index.mock.ts`、`proxy.cache.json`、`proxy.ts` 这4个文件名称

:::

在使用的过程中会生成4个文件

1. `index.mock.cache.json`: 生成mock数据的原始配置(页面渲染取值)

```json
{
  "mockList": [
    {
      "url": "/api/test",
      "method": "POST",
      "status": "200",
      "delay": 0,
      "body": {
        "code": 200,
        "data": {
          "id": "@id",
          "name": "@name",
          "email": "@email"
        },
        "message": "success"
      },
      "listCount": 20
    },
  ],
  "rootDir": "...",
  "dir": "mock",
  "fileName": "index.mock",
  "cache": "index.mock.cache.json"
}
```

2. `index.mock.ts`: 生成的mock数据

```ts
// Mock 配置文件
export interface MockerItem {
  /**该接口允许的 请求方法，默认同时支持 GET 和 POST*/
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /**状态码*/
  status: string;
  //配置响应延迟时间, 如果传入的是一个数组，则代表延迟时间的范围
  delay: number | [number, number];
  /**响应体(可以自定义返回格式)*/
  body: any;
  /**接口地址*/
  url: string;
  /**列表数据条数（仅 list 格式有效）*/
  listCount?: number;
}
/**mock配置 列表*/
export type DefineMockList = MockerItem[];
export const mockList: DefineMockList = [
  {
    "url": "/api/test",
    "method": "POST",
    "status": "200",
    "delay": 0,
    "body": {
      "code": 200,
      "message": "success",
      "data": {
        "id": "450000200805311843",
        "name": "Sarah Lee",
        "email": "u.azfjyqt@uscf.pe"
      }
    },
    "listCount": 20
  },
];
export default mockList;

```

3. `proxy.cache.json`: 生成代理数据原始配置(页面渲染取值)

```json
{
  "proxyList": [
    {
      "path": "^/docks",
      "target": "http://localhost:9009"
    }
  ],
  "rootDir": "...",
  "dir": "mock",
  "fileName": "proxy",
  "cache": "proxy.cache.json"
}
```

4. `proxy.ts`: 生成的代理服务数据

```tsx
// 代理配置文件
/**
 * 代理配置参数
 */
export type ProxyItem = Record<string,{
  /**转发地址*/
  target: string,
  /**路径重写*/
  pathRewrite?: Record<string, string>,
  /**是否开启ws*/
  ws?: boolean
}> 

export const proxyConfig: ProxyItem = {
  "^/tsx": {
    "target": "http://localhost:9009"
  },
  "^/wsdse": {
    "target": "http://localhost:8982",
    "pathRewrite": {
      "^/wsdse": ""
    },
    "ws": true
  },
  "^/docks": {
    "target": "http://localhost:9009"
  }
};
export default proxyConfig;
    
```

