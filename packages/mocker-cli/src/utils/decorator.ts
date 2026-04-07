
import express from 'express';
import { fairysMockerBase } from "../base.js"

export type ClassStruct<TInstanceType extends unknown = unknown> = new (
  ...args: any[]
) => TInstanceType;

export interface RouteItemType {
  method: 'get' | 'delete' | 'post' | 'put' | 'patch' | 'head' | 'options';
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

// GET 方法装饰器（新版标准，100% 触发）
export function Get(path: string) {
  return (target: any, context: ClassMethodDecoratorContext) => {
    if (context.kind === 'method') {
      routesMap.set(target, { method: 'get', path, funName: context.name })
    }
    // ✅ 正确包装函数（必须用 context.addInitializer）
    // const methodName = context.name;
    // context.addInitializer(function (this: any) {
    //   const originalMethod = this[methodName];
    //   // 替换成包装方法
    //   this[methodName] = (...args: any[]) => {
    //     console.log('✅ 接口访问执行了:', path); // 这里一定会打印
    //     return originalMethod.apply(this, args);
    //   };
    // });
  };
}

// Method 方法装饰器
export function MethodPath(path: string, method: RouteItemType['method'] = 'post') {
  return (target: any, context: ClassMethodDecoratorContext) => {
    if (context.kind === 'method') {
      routesMap.set(target, {
        method: method.toLowerCase() as RouteItemType['method'],
        path, funName: context.name
      })
    }
  };
}
export function Delete(path: string) {
  return MethodPath(path, 'delete');
}

export function Put(path: string) {
  return MethodPath(path, 'put');
}

export function Patch(path: string) {
  return MethodPath(path, 'patch');
}

export function Head(path: string) {
  return MethodPath(path, 'head');
}

export function Options(path: string) {
  return MethodPath(path, 'options');
}

/**属性默认值*/
export function ClassAttributeDefault(defaultVal: any) {
  return function (target: undefined, context: ClassFieldDecoratorContext) {
    // 返回的函数会接收原始默认值，返回新值
    return (initialValue: any) => {
      return initialValue ?? defaultVal;
    };
  };
}


// 注册路由（constructor 调用）
export function registerControllerRoute(instance: unknown, router?: express.Router) {
  const fairysRouter = router || fairysMockerBase.fairysMockerRouter;
  if (!fairysRouter) {
    console.log('请先初始化内置路由');
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
    /**方法 - 从实例上获取，而不是从原型上获取，这样可以获取到被装饰器包装后的方法*/
    const _requestHandle: (req: express.Request, res: express.Response, next: express.NextFunction) => void = (instance as any)[controllerMethod];
    // const _requestHandle: (req: express.Request, res: express.Response, next: express.NextFunction) => void = proto[controllerMethod];
    /**解决this指向问题*/
    const boundRequestHandle: (req: express.Request, res: express.Response, next: express.NextFunction) => void = _requestHandle.bind(instance);
    /**获取当前方法配置 - 仍然需要从原型上获取，因为装饰器是在原型上设置的*/
    const routeItem = routesMap.get(proto[controllerMethod]);
    if (routeItem) {
      /**拼接前缀*/
      const fullPath = (controllerAPIRootPath?.prefix || '') + routeItem.path;
      /**方法*/
      fairysRouter[routeItem.method](fullPath, (req, res, next) => boundRequestHandle(req, res, next));
    }
  }
}
