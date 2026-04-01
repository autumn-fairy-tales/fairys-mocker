import React, { useEffect, } from 'react';
import { useProxyStore } from "@carefrees/valtio"
import { useGlobalProxyStore } from "@/models"
import { API_BASE_URL } from "@/utils"
import { Table } from '@/components/table';
import { createProxyData, type ProxyItem, type ProxyList } from '@fairys/create-mock-data';

export default function ProxyConfig() {

  const { state: _globalState, proxyInstance: _globalProxyInstance } = useGlobalProxyStore()
  const isServer = _globalState.isServer

  const { state, dispatch, proxyInstance } = useProxyStore<{
    rootDir: string,
    dir: string,
    fileName: string,
    proxyList: ProxyList,
    response: string,
    isModalOpen: boolean,
    currentIndex: number | null,
    modalBody: string
  }>({
    rootDir: "",
    dir: "mock",
    fileName: "proxy",
    proxyList: [],
    response: "",
    isModalOpen: false,
    currentIndex: null,
    modalBody: ''
  }, { sync: true })

  const proxyList = state.proxyList;
  const response = state.response
  const isModalOpen = state.isModalOpen
  const currentIndex = state.currentIndex
  const modalBody = state.modalBody
  const rootDir = state.rootDir;
  const dir = state.dir;
  const fileName = state.fileName

  // 获取缓存数据的函数
  const fetchCacheData = async () => {
    try {
      const params = `dir=${decodeURIComponent(dir)}&fileName=${decodeURIComponent(fileName)}&rootDir=${decodeURIComponent(rootDir)}`
      const res = await fetch(`${API_BASE_URL}/_fairys/_mocker/_proxy?${params}`);
      const data = await res.json();
      if (data.code === 200) {
        let proxyList = data.data
        if (!Array.isArray(data.data)) {
          proxyList = []
        }
        dispatch({
          proxyList: proxyList,
          dir: data.dir,
          fileName: data.fileName,
          rootDir: data.rootDir
        })
      } else {
        dispatch({ proxyList: [], })
      }
    } catch (error) {
      _globalProxyInstance.store.isServer = false
      console.error('获取缓存数据失败:', error);
    }
  }
  // 在组件加载时获取缓存的配置数据
  useEffect(() => {
    fetchCacheData();
  }, []);

  const addProxyItem = () => {
    const proxyList = proxyInstance.store.proxyList || []
    dispatch({
      proxyList: [...proxyList].concat([{
        path: `/api/test${proxyList.length + 1}`,
        target: 'http://localhost:3000',
      }])
    })
  };

  const removeProxyItem = (index: number) => {
    const proxyList = proxyInstance.store.proxyList || []
    dispatch({
      proxyList: proxyList.filter((_, i) => i !== index)
    })
  };

  const updateProxyItem = (index: number, key: keyof ProxyItem, value: any) => {
    const proxyList = proxyInstance.store.proxyList || []
    dispatch({ proxyList: proxyList.map((item, i) => i === index ? { ...item, [key]: value } : item) })
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 校验所有必填字段
    let isValid = true;
    let errorMessage = '';
    for (let i = 0; i < proxyList.length; i++) {
      const item = proxyList[i];
      // 校验接口地址
      if (!item.path.trim()) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 路径 不能为空`;
        break;
      }
      // 校验接口地址
      if (!item.target.trim()) {
        isValid = false;
        errorMessage = `接口配置 #${i + 1} 的 目标地址 不能为空`;
        break;
      }
    }

    if (!isValid) {
      _globalProxyInstance.open('error', errorMessage);
      return;
    }

    // 校验接口地址+请求方法是否重复
    const seenCombinations = new Map<string, number[]>();
    for (let i = 0; i < proxyList.length; i++) {
      const item = proxyList[i];
      const combination = `${item.path.trim()}`;
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
          errorMessage.push(<div key={key}>第 {value.join(',')} 行数据 路径重复;</div>);
      }
      if (errorMessage.length > 0) {
        _globalProxyInstance.open('error', errorMessage, 5000);
        return;
      }
    }
    try {
      if (isServer) {
        const res = await fetch(`${API_BASE_URL}/_fairys/_mocker/_proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            proxyList,
            dir,
            fileName,
            rootDir,
          }),
        });
        const data = await res.json();
        if (proxyList.length > 0) {
          dispatch({ response: JSON.stringify(data, null, 2) })
        } else if (data.code === 200) {
          _globalProxyInstance.open('success', "保存成功");
        }
        dispatch({ rootDir: data.rootDir })
      } else {
        if (proxyList.length > 0) {
          const proxyData = createProxyData(proxyList as any[]);
          dispatch({ response: JSON.stringify(proxyData, null, 2) })
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
      modalBody: JSON.stringify(proxyList[index].pathRewrite, null, 2),
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
        const body = JSON.parse(modalBody);
        updateProxyItem(currentIndex, 'pathRewrite', body);
        closeBodyModal();
      } catch (error) {
        // 解析失败时不更新
        _globalProxyInstance.open('error', 'JSON 格式错误，请检查输入');
      }
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col box-border  overflow-hidden">
      <div className="text-center mb-6 text-xs text-zinc-600 dark:text-zinc-300 box-border">
        当前配置总条数: {proxyList.length}
      </div>
      <div className="mb-6">
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          数据保存到本地参数
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
            onClick={() => fetchCacheData()}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap text-xs"
          >
            查询
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          默认保存到当前工作目录的 mock 文件夹
        </p>
      </div>
      {proxyList.length > 0 ? (
        <div className="flex-1 flex flex-col box-border overflow-auto">
          <Table<ProxyItem>
            columns={[
              {
                title: "#",
                tdClassName: "px-2 py-2 text-xs text-zinc-800 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700",
                isIndex: true,
              },
              {
                title: "接口地址",
                dataIndex: "path",
                render: (item, index) => {
                  return <input
                    type="text"
                    value={item.path}
                    onChange={(e) => updateProxyItem(index, 'path', e.target.value)}
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                  />
                }
              },
              {
                title: "目标地址",
                dataIndex: "target",
                render: (item, index) => {
                  return <input
                    type="text"
                    value={item.target}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateProxyItem(index, 'target', value || '');
                    }}
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                    placeholder="目标地址"
                  />
                }
              },
              {
                title: "启用 WebSocket",
                dataIndex: "enableWebSocket",
                render: (item, index) => {
                  return <input
                    type="checkbox"
                    checked={item.ws || false}
                    onChange={(e) => {
                      const value = e.target.checked;
                      updateProxyItem(index, 'ws', value);
                    }}
                    className="mr-2"
                  />
                }
              },
              {
                title: "操作",
                dataIndex: "operation",
                render: (_, index) => {
                  return <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => openBodyModal(index)}
                      className="px-2 py-0.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                    >
                      编辑路径重写数据
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProxyItem(index)}
                      className="px-2 py-0.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs"
                    >
                      删除
                    </button>
                  </div>
                }
              },
            ]}
            dataSource={proxyList as ProxyItem[]}
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
          onClick={addProxyItem}
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
      {isModalOpen && currentIndex !== null && proxyList?.[currentIndex] && (
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
                  路径重写 JSON <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={modalBody}
                  onChange={(e) => dispatch({ modalBody: e.target.value })}
                  className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white min-h-[300px] text-xs"
                  placeholder='例如: { "^/api":"" , "^/api/test":"/api" }'
                />
              </div>
            </div>
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
  );
}
