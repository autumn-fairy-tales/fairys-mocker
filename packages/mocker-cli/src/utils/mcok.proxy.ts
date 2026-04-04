
/**保存配置和读取配置*/
import nodePath from "node:path"
import fs from 'node:fs';
import { utilsGlobalVariable } from "./utils.js";
import { createProxyData, createMockData, ProxyList, DefineMockList } from "@fairys/create-mock-data";

export const getProxyFile = (rootDir?: string, dir?: string, fileName?: string) => {
  const _rootDir = rootDir?.trim() || utilsGlobalVariable.rootDir;
  const _dir = dir?.trim() || utilsGlobalVariable.dir;
  const _fileName = fileName?.trim() || utilsGlobalVariable.proxyFile;
  // 读取 .cache.json 文件
  const proxyDir = nodePath.join(_rootDir, _dir);
  const cacheFilePath = nodePath.join(proxyDir, _fileName + '.cache.json');
  if (fs.existsSync(cacheFilePath)) {
    const cacheFileContent = fs.readFileSync(cacheFilePath, 'utf-8');
    const cacheData = JSON.parse(cacheFileContent);
    const proxyList = cacheData.proxyList || [];
    return {
      proxyList,
      rootDir: _rootDir,
      dir: _dir,
      fileName: _fileName,
      cache: _fileName + '.cache.json',
    }
  }
  return undefined
}

export const createProxyFile = (proxyList: ProxyList, rootDir?: string, dir?: string, fileName?: string) => {
  const _rootDir = rootDir?.trim() || utilsGlobalVariable.rootDir;
  const _dir = dir?.trim() || utilsGlobalVariable.dir;
  const _fileName = fileName?.trim() || utilsGlobalVariable.proxyFile;
  // 读取 .cache.json 文件
  const proxyDir = nodePath.join(_rootDir, _dir);

  if (!fs.existsSync(proxyDir)) {
    fs.mkdirSync(proxyDir, { recursive: true });
  }
  const proxyConfig = createProxyData(proxyList)
  if (utilsGlobalVariable.isCreateProxyDataFile) {
    const proxyFilePath = nodePath.join(proxyDir, `${_fileName}.ts`);
    const proxyFileContent = `// 代理配置文件
// 自动生成于 ${new Date().toISOString()}

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

export const proxyConfig: ProxyItem = ${JSON.stringify(proxyConfig, null, 2)};
export default proxyConfig;
    `;
    fs.writeFileSync(proxyFilePath, proxyFileContent);
  }

  // 存储原始的 proxyConfig 到 .cache.json 文件
  const cacheFilePath = nodePath.join(proxyDir, _fileName + '.cache.json');
  const cacheFileContent = JSON.stringify({
    proxyList,
    rootDir: _rootDir,
    dir: _dir,
    fileName: _fileName,
    cache: _fileName + '.cache.json',
  }, null, 2);
  fs.writeFileSync(cacheFilePath, cacheFileContent);

  return {
    proxyConfig,
    rootDir: _rootDir,
    dir: _dir,
    fileName: _fileName,
    cache: _fileName + '.cache.json',
  }
}

export const getMcokFile = (rootDir?: string, dir?: string, fileName?: string) => {
  const _rootDir = rootDir?.trim() || utilsGlobalVariable.rootDir;
  const _dir = dir?.trim() || utilsGlobalVariable.dir;
  const _fileName = fileName?.trim() || utilsGlobalVariable.file;
  // 读取 .cache.json 文件
  const mockDir = nodePath.join(_rootDir, _dir);
  const cacheFilePath = nodePath.join(mockDir, _fileName + '.cache.json');
  if (fs.existsSync(cacheFilePath)) {
    const cacheFileContent = fs.readFileSync(cacheFilePath, 'utf-8');
    const cacheData = JSON.parse(cacheFileContent);
    const mockList = cacheData.mockList || [];
    return {
      mockList,
      rootDir: _rootDir,
      dir: _dir,
      fileName: _fileName,
      cache: _fileName + '.cache.json',
    }
  }
  return undefined
}

export const createMockFile = (mockList: DefineMockList, rootDir?: string, dir?: string, fileName?: string) => {
  const _rootDir = rootDir?.trim() || utilsGlobalVariable.rootDir;
  const _dir = dir?.trim() || utilsGlobalVariable.dir;
  const _fileName = fileName?.trim() || utilsGlobalVariable.file;
  // 读取 .cache.json 文件
  const mockDir = nodePath.join(_rootDir, _dir);

  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir, { recursive: true });
  }
  const mockConfig = createMockData(mockList)
  if (utilsGlobalVariable.isCreateMockDataFile) {
    const mockFilePath = nodePath.join(mockDir, `${_fileName}.ts`);
    const mockFileContent = `// Mock 配置文件
// 自动生成于 ${new Date().toISOString()}
    
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

export const mockList: DefineMockList = ${JSON.stringify(mockConfig, null, 2)};
export default mockList;
    `;
    fs.writeFileSync(mockFilePath, mockFileContent);
  }

  // 存储原始的 mockConfig 到 .cache.json 文件
  const cacheFilePath = nodePath.join(mockDir, _fileName + '.cache.json');

  const cacheFileContent = JSON.stringify({
    mockList,
    rootDir: _rootDir,
    dir: _dir,
    fileName: _fileName,
    cache: _fileName + '.cache.json',
  }, null, 2);
  fs.writeFileSync(cacheFilePath, cacheFileContent);

  return {
    mockConfig,
    rootDir: _rootDir,
    dir: _dir,
    fileName: _fileName,
    cache: _fileName + '.cache.json',
  }
}
