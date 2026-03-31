import React, { useEffect } from 'react';
import { useProxyStore } from "@carefrees/valtio"
import { useGlobalProxyStore } from "@/models"
import type { ProxyItem } from "@/interface"
import { API_BASE_URL } from "@/utils"


export default function ProxyConfig() {
  const { state: _globalState, proxyInstance: _globalProxyInstance } = useGlobalProxyStore()

  const { state, dispatch, proxyInstance } = useProxyStore<{
    proxyConfig: ProxyItem,
    rootDir: string,
    dir: string,
    fileName: string,
  }>({
    proxyConfig: {},
    rootDir: '',
    dir: 'mock',
    fileName: 'proxy',
  }, { sync: true })
  const rootDir = state.rootDir;
  const dir = state.dir;
  const fileName = state.fileName;
  const proxyConfig = state.proxyConfig;

  // 获取代理配置数据的函数
  const fetchProxyData = async () => {
    try {
      const params = `dir=${decodeURIComponent(dir)}&fileName=${decodeURIComponent(fileName)}&rootDir=${decodeURIComponent(rootDir)}`
      const res = await fetch(`${API_BASE_URL}/api/proxy?${params}`);
      const data = await res.json();
      if (data.code === 200) {
        dispatch({
          proxyConfig: data.data,
          dir: data.dir,
          fileName: data.fileName,
          rootDir: data.rootDir,
        })
      } else {
        dispatch({
          proxyConfig: {},
        })
      }
    } catch (error) {
      console.error('获取代理配置数据失败:', error);
    }
  };

  // 在组件加载时获取代理配置数据
  useEffect(() => {
    fetchProxyData();
  }, []);

  // 保存代理配置
  const handleProxySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let errorMessage = []
      const _newConfig = { ...proxyConfig }

      // 处理 proxyConfig 中参数
      for (const path in _newConfig) {
        const config = _newConfig[path];
        if (typeof config === 'string') {
          continue;
        }
        const _item = { ...config }
        if (_item._pathRewrite) {
          try {
            _item.pathRewrite = JSON.parse(_item._pathRewrite);
          } catch (error) {
            errorMessage.push(<div key={path}>路径 {path} 的配置,路径重写字符串格式错误</div>);
          }
        }
      }

      if (errorMessage.length > 0) {
        _globalProxyInstance.open('error', errorMessage, 5000);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proxyConfig,
          dir,
          fileName,
          rootDir,
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        _globalProxyInstance.open('success', '代理配置保存成功');
        // setRootDir(data.rootDir);
        dispatch({ rootDir: data.rootDir })
      }
    } catch (error) {
      _globalProxyInstance.open('error', '保存代理配置失败');
    }
  };

  // 添加代理配置项
  const addProxyItem = () => {
    proxyInstance.store.proxyConfig = {
      ...proxyInstance.store.proxyConfig,
      [`/api${Object.keys(proxyInstance.store.proxyConfig || {}).length + 1}`]: 'http://localhost:3000'
    }
  };

  // 删除代理配置项
  const removeProxyItem = (path: string) => {
    const proxyConfig = proxyInstance.store.proxyConfig || {}
    delete proxyConfig[path];
    proxyInstance.store.proxyConfig = { ...proxyConfig }
  };

  // 更新代理配置项
  const updateProxyItem = (path: string, value: string | { target: string, pathRewrite?: Record<string, string>, _pathRewrite?: string, ws?: boolean }) => {
    proxyInstance.store.proxyConfig = {
      ...proxyInstance.store.proxyConfig,
      [path]: value
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col box-border  overflow-hidden">
      <div className="text-center mb-6 text-xs text-zinc-600 dark:text-zinc-300 box-border">
        当前配置总条数: {Object.keys(proxyConfig || {}).length}
      </div>
      <div className="mb-6">
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          代理配置保存参数
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
            onClick={fetchProxyData}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap text-xs"
          >
            查询
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          默认保存到当前工作目录的 mock 文件夹
        </p>
      </div>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">代理配置列表</h3>
        {Object.keys(proxyConfig).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(proxyConfig).map(([path, config]) => (
              <div key={path} className="border border-zinc-200 dark:border-zinc-700 rounded-md p-3">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      路径
                    </label>
                    <input
                      type="text"
                      value={path}
                      onChange={(e) => {
                        const newPath = e.target.value;
                        if (newPath && newPath !== path) {
                          const newConfig = { ...proxyConfig };
                          const configValue = newConfig[path];
                          delete newConfig[path];
                          proxyInstance.store.proxyConfig = {
                            ...newConfig,
                            [newPath]: configValue,
                          }
                        }
                      }}
                      className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProxyItem(path)}
                    className="px-2 py-0.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs ml-2"
                  >
                    删除
                  </button>
                </div>
                {typeof config === 'string' ? (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      目标地址
                    </label>
                    <input
                      type="text"
                      value={config}
                      onChange={(e) => updateProxyItem(path, e.target.value)}
                      className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        目标地址
                      </label>
                      <input
                        type="text"
                        value={config.target}
                        onChange={(e) => updateProxyItem(path, { ...config, target: e.target.value })}
                        className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        路径重写 (JSON 格式)
                      </label>
                      <textarea
                        value={config._pathRewrite}
                        onChange={(e) => {
                          updateProxyItem(path, { ...config, _pathRewrite: e.target.value });
                        }}
                        className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white min-h-[100px] text-xs"
                        placeholder='例如: {"^/api1": ""}'
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.ws || false}
                        onChange={(e) => updateProxyItem(path, { ...config, ws: e.target.checked })}
                        className="mr-2"
                      />
                      <label className="text-xs text-zinc-700 dark:text-zinc-300">
                        开启 WebSocket
                      </label>
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof config === 'string') {
                        updateProxyItem(path, { target: config, pathRewrite: {}, _pathRewrite: "{}", ws: false });
                      } else {
                        updateProxyItem(path, config.target);
                      }
                    }}
                    className="px-2 py-0.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-xs"
                  >
                    {typeof config === 'string' ? '切换到高级配置' : '切换到简单配置'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            暂无代理配置，请点击"添加代理配置"按钮添加
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addProxyItem}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors mr-4 text-xs"
        >
          添加代理配置
        </button>
        <button
          type="button"
          onClick={handleProxySubmit}
          className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
        >
          保存配置
        </button>
      </div>
    </div>
  );
}
