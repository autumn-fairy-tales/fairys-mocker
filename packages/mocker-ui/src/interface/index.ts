export interface MockerItem {
  /**该接口允许的 请求方法，默认同时支持 GET 和 POST*/
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /**状态码*/
  status: string;
  //配置响应延迟时间, 如果传入的是一个数组，则代表延迟时间的范围
  delay: number;
  /**响应体(可以自定义返回格式)*/
  body: any;
  /**接口地址*/
  url: string;
  /**列表数据条数（仅 list 格式有效）*/
  listCount: number;
}

/**mock配置 列表*/
export type DefineMockList = MockerItem[];

/**
 * 代理配置参数
 */
export type ProxyItem = {
  /**代理路径*/
  path: string,
  /**转发地址*/
  target: string,
  /**路径重写*/
  pathRewrite?: Record<string, string>,
  /**是否开启ws*/
  ws?: boolean
}
export type ProxyList = ProxyItem[];