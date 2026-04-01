
import express from 'express';
import { mainAppCli } from "../main.js"

export type ClassStruct<TInstanceType extends unknown = unknown> = new (
  ...args: any[]
) => TInstanceType;

export interface RouteItemType {
  method: 'get' | 'delete' | 'post' | 'put' | 'patch' | 'head';
  path: string;
  funName?: string | symbol;
}

export interface ControllerItemType {
  prefix?: string;
}

/**控制器参数*/
export const controllerMap = new WeakMap<object, ControllerItemType>();
/**路由方法参数*/
export const routesMap = new WeakMap<object, RouteItemType>();

// 类装饰器：统一前缀
export function Controller(prefix: string) {
  return (target: any, context: ClassDecoratorContext) => {
    controllerMap.set(target, { prefix })
  };
}

// POST 方法装饰器（新版标准，100% 触发）
export function Post(path: string) {
  return (target: any, context: ClassMethodDecoratorContext) => {
    if (context.kind === 'method') {
      routesMap.set(target, { method: 'post', path, funName: context.name })
    }
  };
}

// POST 方法装饰器（新版标准，100% 触发）
export function Get(path: string) {
  return (target: any, context: ClassMethodDecoratorContext) => {
    if (context.kind === 'method') {
      routesMap.set(target, { method: 'get', path, funName: context.name })
    }
  };
}

// 注册路由（constructor 调用）
export function registerRoutes(instance: unknown) {
  const app = mainAppCli.app;
  if (!app) {
    console.log('请先初始化 app');
    return;
  }
  // 获取原型数据
  const proto = Object.getPrototypeOf(instance);
  // 获取控制器前缀
  const controllerAPIRootPath = controllerMap.get(proto.constructor);
  /**实例中方法名*/
  const controllerMethods = Object.getOwnPropertyNames(proto).filter((i) => i !== "constructor");
  /**遍历实例中方法名*/
  for (let index = 0; index < controllerMethods.length; index++) {
    /**获取方法名*/
    const controllerMethod = controllerMethods[index];
    /**方法*/
    const _requestHandle: (req: express.Request, res: express.Response,) => void = proto[controllerMethod];
    const boundRequestHandle: (req: express.Request, res: express.Response) => void = _requestHandle.bind(instance);
    /**获取当前方法配置*/
    const routeItem = routesMap.get(_requestHandle);
    if (routeItem) {
      /**拼接前缀*/
      const fullPath = (controllerAPIRootPath?.prefix || '') + routeItem.path;
      /**方法*/
      app[routeItem.method](fullPath, (req, res) => boundRequestHandle(req, res));
    }
  }
}
