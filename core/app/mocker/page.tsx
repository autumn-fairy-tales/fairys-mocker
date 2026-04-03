'use client';

import React, { useState, useEffect, useCallback } from 'react';

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
  /**列表数据条数（仅 list 格式有效）*/
  listCount: number;
}

/**mock配置 列表*/
type DefineMockList = MockerItem[];

export default function MockerPage() {
  const [mockList, setMockList] = useState<DefineMockList>([
  ]);

  const [response, setResponse] = useState<string>('');
  const [savePath, setSavePath] = useState<string>('mock');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [modalBody, setModalBody] = useState<string>('');
  const [textareaValues, setTextareaValues] = useState<Record<number, string>>({});

  // 获取缓存数据的函数
  const fetchCacheData = useCallback(async () => {
    try {
      const res = await fetch(`/api/mock?savePath=${encodeURIComponent(savePath)}`);
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
      body: { code: 200, data: {}, message: 'success' },
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

      // 校验响应体
      if (!item.body) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 响应体 不能为空`;
        break;
      }
    }

    if (!isValid) {
      alert(errorMessage + ', 请查看其他项是否填写完整');
      return;
    }

    try {
      const res = await fetch('/api/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mockList, savePath }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
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
        alert('JSON 格式错误，请检查输入');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2 text-center">Mocker 数据配置</h1>
        <div className="text-center mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          当前配置总条数: {mockList.length}
        </div>
        <div className="space-y-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
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
                className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white"
              />
              <button
                type="button"
                onClick={fetchCacheData}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap"
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
          {mockList.map((item, index) => (
            <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                  接口配置 #{index + 1}
                </h2>
                <button
                  type="button"
                  onClick={() => removeMockerItem(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    <span className="text-red-500">*</span> 接口地址
                  </label>
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => updateMockerItem(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    <span className="text-red-500">*</span> 请求方法
                  </label>
                  <select
                    value={item.method}
                    onChange={(e) => updateMockerItem(index, 'method', e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                    <option value="HEAD">HEAD</option>
                    <option value="OPTIONS">OPTIONS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    <span className="text-red-500">*</span> 状态码
                  </label>
                  <input
                    type="text"
                    value={item.status}
                    onChange={(e) => updateMockerItem(index, 'status', e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white"
                    placeholder="例如: 200, 400, 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    延迟返回 (毫秒，数组格式: [最小值, 最大值])
                  </label>
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
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white"
                    placeholder="例如: 1000 或 500,2000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  <span className="text-red-500">*</span> 响应体 (支持 Mock.js 语法)
                </label>
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() => openBodyModal(index)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    编辑
                  </button>
                </div>
                <textarea
                  value={textareaValues[index] || JSON.stringify(item.body, null, 2)}
                  onChange={(e) => {
                    // 先更新本地状态，保持光标位置
                    setTextareaValues(prev => ({
                      ...prev,
                      [index]: e.target.value
                    }));
                    // 然后尝试解析并更新 mockList
                    try {
                      const body = JSON.parse(e.target.value);
                      updateMockerItem(index, 'body', body);
                    } catch (error) {
                      // 解析失败时不更新 mockList，但保持本地状态
                    }
                  }}
                  onBlur={() => {
                    // 失去焦点时清除本地状态，确保与 mockList 同步
                    setTextareaValues(prev => {
                      const newValues = { ...prev };
                      delete newValues[index];
                      return newValues;
                    });
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white min-h-[150px]"
                  placeholder='例如: {"code": 200, "data": {"id": "@id", "name": "@name"}, "message": "success"} 或 {"code": 200, "data": {"rows": [{"id": "@id", "name": "@name"}], "total": "@integer(20, 100)"}, "message": "success"}'
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  支持使用 <a href="http://mockjs.com/examples.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mock.js 语法</a>，如 @id, @name, @email 等，
                  <span className='text-red-500'>数组为特殊处理，仅支持 (<b>字段|条数</b>)</span>
                </p>
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={addMockerItem}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors mr-4"
            >
              添加接口配置
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              保存配置
            </button>
          </div>
        </div>

        {response && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                保存结果
              </h2>
              <button
                type="button"
                onClick={() => setResponse('')}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                清除
              </button>
            </div>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md overflow-x-auto text-sm">
              {response}
            </pre>
          </div>
        )}

        {/* 响应体编辑模态框 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                  编辑响应体 - 接口配置 #{currentIndex !== null ? currentIndex + 1 : ''}
                </h2>
                <button
                  type="button"
                  onClick={closeBodyModal}
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ×
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  响应体 JSON
                </label>
                <textarea
                  value={modalBody}
                  onChange={(e) => setModalBody(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white min-h-[400px]"
                  placeholder='例如: {"code": 200, "data": {"id": "@id", "name": "@name"}, "message": "success"} 或 {"code": 200, "data": {"rows": [{"id": "@id", "name": "@name"}], "total": "@integer(20, 100)"}, "message": "success"}'
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                支持使用 <a href="http://mockjs.com/examples.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mock.js 语法</a>，如 @id, @name, @email 等，
                <span className='text-red-500'>数组为特殊处理，仅支持 (<b>字段|条数</b>)</span>
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeBodyModal}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveBodyModal}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
