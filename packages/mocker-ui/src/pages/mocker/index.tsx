import React, { Fragment, useEffect, } from 'react';
import { createMockData, type MockerItem, type DefineMockList } from '@fairys/create-mock-data';
import { useProxyStore } from "@carefrees/valtio"
import { useGlobalProxyStore } from "@/models"
import { API_BASE_URL } from "@/utils"
import { Table } from '@/components/table';
import { JSONEdit } from '@/components/json.edit';
import { createPortal } from "react-dom"

export default function MockerConfig() {

  const { state: _globalState, proxyInstance: _globalProxyInstance } = useGlobalProxyStore()
  const isServer = _globalState.isServer

  const { state, dispatch, proxyInstance } = useProxyStore<{
    rootDir: string,
    dir: string,
    fileName: string,
    mockList: DefineMockList,
    response: string,
    isModalOpen: boolean,
    currentIndex: number | null,
    modalBody: string,
    isEnabledStart: boolean
  }>({
    rootDir: "",
    dir: "mock",
    fileName: "index.mock",
    mockList: [],
    response: "",
    isModalOpen: false,
    currentIndex: null,
    modalBody: '',
    isEnabledStart: false
  }, { sync: true })

  const mockList = state.mockList;
  const response = state.response
  const isModalOpen = state.isModalOpen
  const currentIndex = state.currentIndex
  const modalBody = state.modalBody
  const rootDir = state.rootDir;
  const dir = state.dir;
  const fileName = state.fileName
  const isEnabledStart = state.isEnabledStart

  // 检查 Mock 配置服务是否启用
  const checkMockEnabled = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/_fairys/_mock/_is_enabled`).then(res => res.json());
      if (res.code === 200) {
        dispatch({ isEnabledStart: res.data })
        // _globalProxyInstance.open('success', '检查 Mock 配置服务是否启用成功')
      } else {
        // _globalProxyInstance.open('error', '检查 Mock 配置服务是否启用失败')
      }
    } catch (error) {
      console.error('检查 mock 配置服务是否启用失败:', error);
    }
  }

  useEffect(() => {
    checkMockEnabled()
  }, [])

  // 销毁 mock 数据服务的函数
  const destroyMockData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/_fairys/_mock/_destroy`).then(res => res.json());
      if (res.code === 200) {
        dispatch({ isEnabledStart: false })
        _globalProxyInstance.open('success', '销毁 Mock 数据服务成功')
      } else {
        _globalProxyInstance.open('error', '销毁 Mock 数据服务失败')
      }
    } catch (error) {
      console.error('销毁 mock 数据服务失败:', error);
    }
  }

  // 加载 mock 数据服务的函数
  const loadMockData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/_fairys/_mock/_start`).then(res => res.json());
      if (res.code === 200) {
        _globalProxyInstance.open('success', '加载 Mock 数据服务成功')
        dispatch({ isEnabledStart: true })
      } else {
        _globalProxyInstance.open('error', '加载 Mock 数据服务失败')
      }
    } catch (error) {
      console.error('加载 mock 数据服务失败:', error);
    }
  }

  // 获取缓存数据的函数
  const fetchCacheData = async (isUseEffect?: boolean) => {
    try {
      let res
      if (isUseEffect === true) {
        res = await fetch(`${API_BASE_URL}/_fairys/_mock`);
      } else {
        const params = `dir=${decodeURIComponent(dir)}&fileName=${decodeURIComponent(fileName)}&rootDir=${decodeURIComponent(rootDir)}`
        res = await fetch(`${API_BASE_URL}/_fairys/_mock?${params}`);
      }
      const data = await res.json();
      if (data.code === 200) {
        dispatch({
          mockList: data.data,
          dir: data.dir,
          fileName: data.fileName,
          rootDir: data.rootDir
        })
      } else {
        dispatch({ mockList: [], })
      }
    } catch (error) {
      _globalProxyInstance.store.isServer = false
      console.error('获取缓存数据失败:', error);
    }
  }
  // 在组件加载时获取缓存的配置数据
  useEffect(() => {
    fetchCacheData(true);
  }, []);

  const addMockerItem = () => {
    const mockList = proxyInstance.store.mockList || []
    dispatch({
      mockList: [...mockList].concat([{
        url: ``,
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
        listCount: 20,
      }])
    })
  };

  const removeMockerItem = (index: number) => {
    const mockList = proxyInstance.store.mockList || []
    dispatch({
      mockList: mockList.filter((_, i) => i !== index)
    })
  };

  const updateMockerItem = (index: number, key: keyof MockerItem, value: any) => {
    const mockList = proxyInstance.store.mockList || []
    dispatch({ mockList: mockList.map((item, i) => i === index ? { ...item, [key]: value } : item) })
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
      _globalProxyInstance.open('error', errorMessage);
      return;
    }

    // 校验接口地址+请求方法是否重复
    const seenCombinations = new Map<string, number[]>();
    for (let i = 0; i < mockList.length; i++) {
      const item = mockList[i];
      const combination = `${item.url.trim()}:${item.method}`;
      if (seenCombinations.has(combination)) {
        seenCombinations.get(combination)?.push(i + 1);
      } else {
        seenCombinations.set(combination, [i + 1]);
      }
    }
    if (seenCombinations.size > 0) {
      let errorMessage = []
      for (let [key, value] of seenCombinations) {
        if (value.length > 1)
          errorMessage.push(<div key={key}>第 {value.join(',')} 行数据 接口地址和请求方法 组合重复;</div>);
      }
      if (errorMessage.length > 0) {
        _globalProxyInstance.open('error', errorMessage, 5000);
        return;
      }
    }
    try {
      if (isServer) {
        const res = await fetch(`${API_BASE_URL}/_fairys/_mock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mockList,
            dir,
            fileName,
            rootDir,
          }),
        });

        const data = await res.json();
        if (mockList.length > 0) {
          dispatch({ response: JSON.stringify(data, null, 2) })
        } else if (data.code === 200) {
          _globalProxyInstance.open('success', "保存成功");
        }
        dispatch({ rootDir: data.rootDir })
      } else {
        if (mockList.length > 0) {
          const mockData = createMockData(mockList as any[]);
          dispatch({ response: JSON.stringify(mockData, null, 2) })
        } else {
          _globalProxyInstance.open('success', "操作成功");
        }
      }
    } catch (error) {
      dispatch({ response: 'Error: ' + (error as Error).message })
    }
  };

  const openBodyModal = (index: number) => {
    dispatch({
      currentIndex: index,
      modalBody: JSON.stringify(mockList[index].body, null, 2),
      isModalOpen: true,
    })
    // 禁止页面滚动
    document.body.style.overflow = 'hidden';
  };

  const closeBodyModal = () => {
    dispatch({
      currentIndex: undefined,
      modalBody: '',
      isModalOpen: false,
    })
    // 恢复页面滚动
    document.body.style.overflow = 'auto';
  };

  const saveBodyModal = () => {
    if (currentIndex !== null) {
      try {
        const jsonData = new Function('return ' + modalBody)();
        updateMockerItem(currentIndex, 'body', jsonData);
        closeBodyModal();
      } catch (error) {
        // 解析失败时不更新
        _globalProxyInstance.open('error', 'JSON 格式错误，请检查输入');
      }
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col box-border  overflow-hidden">
      <div className="mb-6 text-xs text-zinc-600 dark:text-zinc-300 box-border flex justify-between">
        <div>当前配置总条数: {mockList.length}</div>
        {isServer ? <div className="flex gap-2">
          <button
            type="button"
            onClick={loadMockData}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
          >
            {isEnabledStart ? "重启" : "启动"} mock 数据服务
          </button>
          {isEnabledStart ? <button
            type="button"
            onClick={destroyMockData}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs"
          >
            销毁 mock 数据服务
          </button> : <Fragment />}
        </div> : <Fragment />}
      </div>
      <div className="mb-6">
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          数据保存到本地
        </label>
        <div className="flex gap-4">
          <div className='flex-1 flex  items-center gap-2'>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              根目录
            </label>
            <input
              type="text"
              value={rootDir}
              onChange={(e) => {
                const newPath = e.target.value;
                dispatch({ rootDir: newPath })
              }}
              className="flex-1 px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
            />
          </div>
          <div className='flex-1 flex  items-center gap-2'>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              目录名
            </label>
            <input
              type="text"
              value={dir}
              onChange={(e) => {
                const newPath = e.target.value;
                dispatch({ dir: newPath })
              }}
              className="flex-1 px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
            />
          </div>
          <div className='flex-1 flex items-center  gap-2'>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              文件名
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => {
                const newPath = e.target.value;
                dispatch({ fileName: newPath })

              }}
              className="flex-1 px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchCacheData(false)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap text-xs"
          >
            查询
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          默认保存到当前工作目录的 mock 文件夹
        </p>
      </div>
      {mockList.length > 0 ? (
        <div className="flex-1 flex flex-col box-border overflow-auto">
          <Table<MockerItem>
            columns={[
              {
                title: "#",
                isIndex: true,
                tdClassName: "px-2 py-2 text-xs text-zinc-800 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700"
              },
              {
                title: "接口地址",
                dataIndex: "url",
                render(item, index) {
                  return <input
                    type="text"
                    placeholder="请输入接口地址"
                    value={item.url}
                    onChange={(e) => updateMockerItem(index, 'url', e.target.value)}
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                  />
                },
              },
              {
                title: "请求方法",
                dataIndex: "method",
                render(item, index) {
                  return <select
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
                },
              },
              {
                title: "状态码",
                dataIndex: "status",
                render(item, index) {
                  return <input
                    type="text"
                    value={item.status}
                    onChange={(e) => updateMockerItem(index, 'status', e.target.value)}
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                    placeholder="例如: 200, 400, 500"
                  />
                },
              },
              {
                title: "响应延迟时间(ms)",
                dataIndex: "delay",
                render(item, index) {
                  return <input
                    type="text"
                    // @ts-ignore
                    value={Array.isArray(item.delay) ? `${item.delay[0]},${item.delay[1]}` : item.delay || ''}
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
                },
              },

              {
                title: "生成数据条数",
                dataIndex: "listCount",
                render(item, index) {
                  return <input
                    type="number"
                    value={item.listCount}
                    onChange={(e) => updateMockerItem(index, 'listCount', parseInt(e.target.value) || 1)}
                    min="1"
                    max="100"
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                  />
                }
              },
              {
                title: "响应体数据",
                dataIndex: "body",
                render(item) {
                  return <div className="text-zinc-500 dark:text-zinc-400 text-xs w-[400px]">
                    {JSON.stringify(item.body, null, 2)}
                  </div>
                }
              },
              {
                title: "操作",
                dataIndex: "operation",
                render(_, index) {
                  return <div className="flex space-x-1">
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
                }
              }

            ]}
            dataSource={mockList as MockerItem[]}
          />
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

      {response && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-xl p-4 flex flex-col w-full max-w-2xl max-h-[80%]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                mock 数据
              </h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  title="复制"
                  onClick={() => {
                    navigator.clipboard.writeText(response);
                    _globalProxyInstance.open('success', '复制成功');
                  }}
                  className="px-2 py-0.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                >
                  复制
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ response: '' })}
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
        createPortal(<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 box-border">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-xl p-4 w-full max-w-2xl box-border">
            <div className="flex justify-between items-center mb-3 box-border">
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
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  生成数据条数
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
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  响应体 JSON <span className="text-red-500">*</span>
                </label>
                <JSONEdit
                  value={modalBody}
                  onChange={(modalBody) => dispatch({ modalBody })}
                  placeholder='例如: {"code": 200, "data": {"id": "@id", "name": "@name"}, "message": "success"} 或 {"code": 200, "data": {"rows": [{"id": "@id", "name": "@name"}], "total": "@integer(20, 100)"}, "message": "success"}'
                  className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white min-h-[300px] text-xs"
                />
              </div>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              支持使用 <a href="http://mockjs.com/examples.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mock.js 语法</a>，如 @id, @name, @email 等，
              <div className='text-red-500'>数组数据为特殊处理,使用`_|`开头，后面拼接字段：<b>_|字段|条数</b> 或者 <b>_|字段</b></div>
            </div>
            <div className="flex justify-end space-x-2 mt-3 box-border">
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
        </div>, document.body)
      )}
    </div>
  );
}
