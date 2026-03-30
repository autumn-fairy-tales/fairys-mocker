import { NextRequest, NextResponse } from 'next/server';
import Mock from 'mockjs';
import fs from 'fs';
import path from 'path';

interface MockerItem {
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
  /**响应体格式类型*/
  bodyFormat: 'object' | 'list';
  /**列表数据条数（仅 list 格式有效）*/
  listCount: number;
}

/**mock配置 列表*/
type DefineMockList = MockerItem[];

export async function POST(request: NextRequest) {
  try {
    const { mockList, savePath }: { mockList: DefineMockList; savePath: string } = await request.json();
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
    // 保存配置时不模拟延迟，延迟应在实际请求接口时生效
    // 存储到本地文件
    const safeSavePath = savePath.trim() ?? 'mock';
    const mockerDir = path.join(process.cwd(), safeSavePath);
    if (!fs.existsSync(mockerDir)) {
      fs.mkdirSync(mockerDir, { recursive: true });
    }
    const mockFilePath = path.join(mockerDir, 'index.mock.ts');
    const mockFileContent = `// Mock 配置文件
// 自动生成于 ${new Date().toISOString()}

interface MockerItem {
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
  /**响应体格式类型*/
  bodyFormat: 'object' | 'list';
  /**列表数据条数（仅 list 格式有效）*/
  listCount?: number;
}

/**mock配置 列表*/
export type DefineMockList = MockerItem[];

export const mockList: DefineMockList = ${JSON.stringify(processedList, null, 2)};
`;

    fs.writeFileSync(mockFilePath, mockFileContent);

    // 存储原始的 mockList 到 .cache.json 文件
    const cacheFilePath = path.join(mockerDir, '.cache.json');
    const cacheFileContent = JSON.stringify(mockList, null, 2);
    fs.writeFileSync(cacheFilePath, cacheFileContent);

    return NextResponse.json({
      code: 200,
      message: 'Mock 配置保存成功',
      data: processedList,
      filePath: mockFilePath,
      cachePath: cacheFilePath,
    });
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: '保存 Mock 配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const savePath = searchParams.get('savePath')?.trim() ?? 'mock';

    // 读取 .cache.json 文件
    const mockerDir = path.join(process.cwd(), savePath);
    const cacheFilePath = path.join(mockerDir, '.cache.json');

    if (fs.existsSync(cacheFilePath)) {
      const cacheFileContent = fs.readFileSync(cacheFilePath, 'utf-8');
      const mockList = JSON.parse(cacheFileContent);

      return NextResponse.json({
        code: 200,
        message: '读取 Mock 配置成功',
        data: mockList,
        cachePath: cacheFilePath,
      });
    } else {
      return NextResponse.json({
        code: 404,
        message: 'Mock 配置文件不存在',
      });
    }
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: '读取 Mock 配置失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}
