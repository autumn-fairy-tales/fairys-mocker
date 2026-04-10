import Mock from "mockjs"

export interface MockerItem {
  /**SQLite库中生成的 id*/
  id?: number,
  /**该接口允许的 请求方法，默认同时支持 GET 和 POST*/
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /**状态码*/
  status: string;
  //配置响应延迟时间, 如果传入的是一个数组，则代表延迟时间的范围
  delay: number
  /**响应体(可以自定义返回格式)*/
  body: any;
  /**接口地址*/
  url: string;
  /**列表数据条数（仅 list 格式有效）*/
  listCount: number;
}
export type DefineMockList = MockerItem[];

/**创建 Mock 数据
*/
export function createMockItemData(item: MockerItem) {
  // 生成 Mock 数据
  let mockBody;
  // 为列表格式生成指定数量的数据
  let { data, ...listBody } = { ...item.body };
  const saveData: Record<string, any> = {}
  const objectKeys = Object.keys(data);
  const listCount = item.listCount || 20;
  for (let index = 0; index < objectKeys.length; index++) {
    const key = objectKeys[index];
    const itemConfig = data[key];
    // 处理数组对象数据
    if (/^(\_\|)/.test(key)) {
      /**数组的时候，判断字段是否有 个数 字段*/
      const [_, _key, count] = key.split('|');
      const _count = `${count || ''}`.trim();
      if (itemConfig) {
        saveData[_key] = Array.from({ length: _count ? Number(_count) : listCount }, () => Mock.mock(itemConfig));
      }
    } else {
      const valueMock = Mock.mock({ [key]: itemConfig });
      Object.assign(saveData, valueMock);
    }
  }
  listBody.data = saveData;
  mockBody = listBody;
  // 处理延迟
  return {
    ...item,
    body: mockBody,
    delay: item.delay || 0,
  };
}

/**
 * 创建 Mock 数据
*/
export function createMockData(mockList: MockerItem[]) {
  // 处理每个 Mocker 配置
  const processedList = mockList.map(item => createMockItemData(item));
  return processedList;
}
export default createMockData;

/**
 * 代理配置参数
 */
export type ProxyItem = {
  /**SQLite库中生成的 id*/
  id?: number,
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

/**创建代理数据*/
export const createProxyData = (proxyList: ProxyList) => {
  return proxyList.reduce((pre, next) => {
    const { path, ..._item } = { ...next }
    return { ...pre, [path]: _item }
  }, {} as Record<string, Omit<ProxyItem, 'path'>>)
}