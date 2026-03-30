
import { type MockerItem } from '../pages';
import Mock from 'mockjs';

/**
 * 创建 Mock 数据
*/
export function createMockData(mockList: MockerItem[]) {
  // 处理每个 Mocker 配置
  const processedList = mockList.map(item => {
    // 生成 Mock 数据
    let mockBody;
    if (item.bodyFormat === 'list') {
      // 为列表格式生成指定数量的数据
      let { data, ...listBody } = { ...item.body };
      const saveData: Record<string, any> = {}
      const objectKeys = Object.keys(data);
      const listCount = item.listCount;
      for (let index = 0; index < objectKeys.length; index++) {
        const key = objectKeys[index];
        const value = data[key];
        if (Array.isArray(value)) {
          /**数组的时候，判断字段是否有 个数 字段*/
          const [_key, count] = key.split('|');
          const _count = `${count || ''}`.trim();
          const itemConfig = value?.[0];
          if (itemConfig) {
            saveData[_key] = Array.from({ length: _count ? Number(_count) : listCount }, () => Mock.mock(itemConfig));
          }
        } else {
          const valueMock = Mock.mock({ [key]: value });
          Object.assign(saveData, valueMock);
        }
      }
      listBody.data = saveData;
      mockBody = listBody;
    } else {
      // 直接生成对象格式数据
      mockBody = Mock.mock(item.body);
    }
    // 处理延迟
    let delay = 0;
    if (Array.isArray(item.delay)) {
      const [min, max] = item.delay;
      delay = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      delay = item.delay;
    }
    return {
      ...item,
      body: mockBody,
      delay,
    };
  });
  return processedList;
}

