'use client';
import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { createMockData } from './utils';
import { svgIcons, type IconType, iconTypeColor } from './assets/icon';

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
  /**响应体格式类型*/
  bodyFormat: 'object' | 'list';
  /**列表数据条数（仅 list 格式有效）*/
  listCount: number;
}

class Message {
  _updated: React.Dispatch<React.SetStateAction<{}>> | undefined = undefined;
  messageList: { type: IconType, message: React.ReactNode, id: string }[] = []
  open = (type: IconType, message: React.ReactNode) => {
    const id = new Date().valueOf().toString();
    this.messageList.push({ type, message, id: id });
    this._updated?.({});
    const timer = setTimeout(() => {
      this.messageList = this.messageList.filter(item => item.id !== id);
      this._updated?.({});
      clearTimeout(timer);
    }, 3000);
  }
}
const useMessage = () => {
  const ref = useRef<Message>(null);
  if (!ref.current) {
    ref.current = new Message();
  }
  return ref.current;
};

/**mock配置 列表*/
type DefineMockList = MockerItem[];

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:6901' : window.location.origin;

export default function App() {
  const [, _updated] = useState({});
  const message = useMessage();
  message._updated = _updated;

  const [mockList, setMockList] = useState<DefineMockList>([]);
  const [response, setResponse] = useState<string>('');
  const [savePath, setSavePath] = useState<string>('mock');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [modalBody, setModalBody] = useState<string>('');
  /**是否存在服务端*/
  const isServer = useRef(true);

  // 获取缓存数据的函数
  const fetchCacheData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mock?savePath=${encodeURIComponent(savePath)}`);
      const data = await res.json();
      if (data.code === 200) {
        setMockList(data.data);
        if (data.savePath) {
          setSavePath(data.savePath);
        }
      } else {
        setMockList([]);
      }
    } catch (error) {
      isServer.current = false;
      console.error('获取缓存数据失败:', error);
    }
  }, [savePath]);

  // 在组件加载时获取缓存的配置数据
  useEffect(() => {
    fetchCacheData();
  }, []);

  const addMockerItem = () => {
    setMockList(prev => [...prev, {
      url: `/api/test${prev.length + 1}`,
      method: 'POST',
      status: '200',
      delay: 0,
      body: {
        code: 200,
        data: {
          id: '@id',
          name: '@name',
          email: '@email',
        },
        message: 'success'
      },
      bodyFormat: 'object',
      listCount: 20,
    }]);
  };

  const removeMockerItem = (index: number) => {
    setMockList(prev => prev.filter((_, i) => i !== index));
  };

  const updateMockerItem = (index: number, key: keyof MockerItem, value: any) => {
    setMockList(prev => prev.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 校验所有必填字段
    let isValid = true;
    let errorMessage = '';

    for (let i = 0; i < mockList.length; i++) {
      const item = mockList[i];
      // 校验接口地址
      if (!item.url.trim()) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 接口地址 不能为空`;
        break;
      }

      // 校验请求方法
      if (!item.method) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 请求方法 不能为空`;
        break;
      }

      // 校验状态码
      if (!item.status.trim()) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 状态码 不能为空`;
        break;
      }

      // 校验响应体格式
      if (!item.bodyFormat) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 响应体格式 不能为空`;
        break;
      }

      // 校验生成数据条数（仅 list 格式时）
      if (item.bodyFormat === 'list' && (!item.listCount || item.listCount < 1)) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 生成数据条数 必须大于 0`;
        break;
      }

      // 校验响应体
      if (!item.body) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 响应体 不能为空`;
        break;
      }
    }

    if (!isValid) {
      message.open('error', errorMessage);
      return;
    }

    try {
      if (isServer.current) {
        const res = await fetch(`${API_BASE_URL}/api/mock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mockList, savePath }),
        });

        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        const mockData = createMockData(mockList);
        setResponse(JSON.stringify(mockData, null, 2));
      }
    } catch (error) {
      setResponse('Error: ' + (error as Error).message);
    }
  };

  const openBodyModal = (index: number) => {
    setCurrentIndex(index);
    setModalBody(JSON.stringify(mockList[index].body, null, 2));
    setIsModalOpen(true);
    // 禁止页面滚动
    document.body.style.overflow = 'hidden';
  };

  const closeBodyModal = () => {
    setIsModalOpen(false);
    setCurrentIndex(null);
    setModalBody('');
    // 恢复页面滚动
    document.body.style.overflow = 'auto';
  };

  const saveBodyModal = () => {
    if (currentIndex !== null) {
      try {
        const body = JSON.parse(modalBody);
        updateMockerItem(currentIndex, 'body', body);
        closeBodyModal();
      } catch (error) {
        // 解析失败时不更新
        message.open('error', 'JSON 格式错误，请检查输入');
      }
    }
  };

  return (
    <div className="h-full bg-zinc-50 dark:bg-black p-4 sm:p-6 box-border overflow-hidden flex flex-col">
      {Array.isArray(message.messageList) ? <div
        className='fixed inset-0 flex flex-col items-center z-90 gap-2 py-2 box-border pointer-events-none'
      >
        {message.messageList.map((item) => {
          const Icon = svgIcons[item.type];
          const color = iconTypeColor[item.type];
          return <div
            key={item.id}
            className='shadow-md py-2 px-4 box-border rounded-lg bg-white text-xs flex items-center gap-2'
          >
            {Icon ? <Icon className={color} /> : <Fragment />}
            {item.message}
          </div>
        })}
      </div> : <Fragment />}
      <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 box-border flex flex-col overflow-auto">
        <h1 className="text-xl font-semibold mb-2 text-center text-zinc-800 dark:text-zinc-100 box-border">Mocker 数据配置</h1>
        <div className="text-center mb-6 text-xs text-zinc-600 dark:text-zinc-300 box-border">
          当前配置总条数: {mockList.length}
        </div>
        <div className="space-y-6 flex-1 flex flex-col box-border  overflow-hidden">
          <div className="mb-6">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              数据保存到本地目录名
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={savePath}
                onChange={(e) => {
                  const newPath = e.target.value;
                  setSavePath(newPath);
                }}
                className="flex-1 px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
              />
              <button
                type="button"
                onClick={fetchCacheData}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap text-xs"
              >
                查询
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              默认保存到当前工作目录的 mocker 文件夹
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              工作目录下保存路径: /{savePath || 'mocker'}
            </p>
          </div>
          {mockList.length > 0 ? (
            <div className="flex-1 flex flex-col box-border overflow-auto">
              <table className="border-collapse min-w-full border border-zinc-200 dark:border-zinc-700 relative">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800 sticky -top-px z-10">
                    <th className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">#</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">接口地址</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">请求方法</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">状态码</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">响应延迟时间</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">响应体格式</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">生成数据条数</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockList.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-2 py-2 text-xs text-zinc-800 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => updateMockerItem(index, 'url', e.target.value)}
                          className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                        />
                      </td>
                      <td className="px-2 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <select
                          value={item.method}
                          onChange={(e) => updateMockerItem(index, 'method', e.target.value)}
                          className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                          <option value="HEAD">HEAD</option>
                          <option value="OPTIONS">OPTIONS</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <input
                          type="text"
                          value={item.status}
                          onChange={(e) => updateMockerItem(index, 'status', e.target.value)}
                          className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                          placeholder="例如: 200, 400, 500"
                        />
                      </td>
                      <td className="px-2 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <input
                          type="text"
                          value={Array.isArray(item.delay) ? `${item.delay[0]},${item.delay[1]}` : item.delay}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.includes(',')) {
                              const [min, max] = value.split(',').map(Number);
                              updateMockerItem(index, 'delay', [min, max]);
                            } else {
                              updateMockerItem(index, 'delay', parseInt(value) || 0);
                            }
                          }}
                          className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                          placeholder="例如: 1000 或 500,2000"
                        />
                      </td>
                      <td className="px-2 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <select
                          value={item.bodyFormat}
                          onChange={(e) => {
                            const newFormat = e.target.value as 'object' | 'list';
                            updateMockerItem(index, 'bodyFormat', newFormat);
                            // 根据选择的格式更新响应体内容
                            if (newFormat === 'object') {
                              updateMockerItem(index, 'body', {
                                code: 200,
                                data: { id: '@id', name: '@name', email: '@email' },
                                message: 'success'
                              });
                            } else {
                              updateMockerItem(index, 'body', {
                                code: 200,
                                data: {
                                  rows: [{ id: '@id', name: '@name' }],
                                  total: '@integer(20, 100)'
                                },
                                message: 'success'
                              });
                            }
                          }}
                          className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                        >
                          <option value="object">对象</option>
                          <option value="list">对象数组</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        {item.bodyFormat === 'list' ? (
                          <input
                            type="number"
                            value={item.listCount}
                            onChange={(e) => updateMockerItem(index, 'listCount', parseInt(e.target.value) || 1)}
                            min="1"
                            max="100"
                            className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                          />
                        ) : (
                          <span className="text-zinc-500 dark:text-zinc-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-2 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => openBodyModal(index)}
                            className="px-2 py-0.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                          >
                            编辑响应体数据
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMockerItem(index)}
                            className="px-2 py-0.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              暂无接口配置，请点击"添加接口配置"按钮添加
            </div>
          )}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addMockerItem}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors mr-4 text-xs"
            >
              添加接口配置
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
            >
              保存配置
            </button>
          </div>
        </div>
        {response && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-xl p-4 flex flex-col w-full max-w-2xl max-h-[80%]">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  保存结果
                </h2>
                <div className="flex gap-4">
                  <button
                    type="button"
                    title="复制"
                    onClick={() => {
                      navigator.clipboard.writeText(response);
                      message.open('success', '复制成功');
                    }}
                    className="px-2 py-0.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                  >
                    复制
                  </button>
                  <button
                    type="button"
                    onClick={() => setResponse('')}
                    className="px-2 py-0.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-xs"
                  >
                    关闭
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md overflow-x-auto text-xs text-zinc-800 dark:text-zinc-100">
                {response}
              </pre>
            </div>
          </div>
        )}
        {/* 响应体编辑模态框 */}
        {isModalOpen && currentIndex !== null && mockList?.[currentIndex] && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-xl p-4 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  编辑响应体数据 - 接口配置 #{currentIndex + 1}
                </h2>
                <button
                  type="button"
                  onClick={closeBodyModal}
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    响应体格式 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mockList?.[currentIndex]?.bodyFormat}
                    onChange={(e) => {
                      const newFormat = e.target.value as 'object' | 'list';
                      updateMockerItem(currentIndex, 'bodyFormat', newFormat);
                      // 根据选择的格式更新响应体内容
                      if (newFormat === 'object') {
                        updateMockerItem(currentIndex, 'body', {
                          code: 200,
                          data: { id: '@id', name: '@name', email: '@email' },
                          message: 'success'
                        });
                        setModalBody(JSON.stringify({ code: 200, data: { id: '@id', name: '@name', email: '@email' }, message: 'success' }, null, 2));
                      } else {
                        updateMockerItem(currentIndex, 'body', {
                          code: 200,
                          data: {
                            rows: [{ id: '@id', name: '@name' }],
                            total: '@integer(20, 100)'
                          },
                          message: 'success'
                        });
                        setModalBody(JSON.stringify({ code: 200, data: { rows: [{ id: '@id', name: '@name' }], total: '@integer(20, 100)' }, message: 'success' }, null, 2));
                      }
                    }}
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                  >
                    <option value="object">对象</option>
                    <option value="list">对象数组</option>
                  </select>
                </div>
                {mockList[currentIndex].bodyFormat === 'list' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      生成数据条数 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={mockList[currentIndex].listCount}
                      onChange={(e) => updateMockerItem(currentIndex, 'listCount', parseInt(e.target.value) || 1)}
                      min="1"
                      max="100"
                      className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    响应体 JSON <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={modalBody}
                    onChange={(e) => setModalBody(e.target.value)}
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white min-h-[300px] text-xs"
                    placeholder='例如: {"code": 200, "data": {"id": "@id", "name": "@name"}, "message": "success"} 或 {"code": 200, "data": {"rows": [{"id": "@id", "name": "@name"}], "total": "@integer(20, 100)"}, "message": "success"}'
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                支持使用 <a href="http://mockjs.com/examples.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mock.js 语法</a>，如 @id, @name, @email 等，
                <span className='text-red-500'>数组为特殊处理，仅支持 (<b>字段|条数</b>)</span>
              </p>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={closeBodyModal}
                  className="px-3 py-1 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors text-xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveBodyModal}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
