import { useState } from 'react';
import MockerConfig from './mocker';
import ProxyConfig from './proxy';
import { useGlobalProxyStore } from "@/models"

export default function Root() {
  const { state, dispatch } = useGlobalProxyStore()
  const [loadedTabs, setLoadedTabs] = useState<{ mock: boolean; proxy: boolean }>({ 
    mock: true, // 默认加载第一个标签
    proxy: false 
  });

  const tabKey = state.tabKey

  const handleTabChange = (key: 'mock' | 'proxy') => {
    // 标记该标签为已加载
    setLoadedTabs(prev => ({
      ...prev,
      [key]: true
    }));
    dispatch({ tabKey: key });
  };

  return (
    <div className="h-full bg-zinc-50 dark:bg-black p-4 sm:p-6 box-border overflow-hidden flex flex-col">
      <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 box-border flex flex-col overflow-hidden">
        {/* 页面切换选项卡 */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
          <button
            className={`px-4 py-2 text-xs font-medium transition-colors ${tabKey === 'mock' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            onClick={() => handleTabChange('mock')}
          >
            Mocker 数据配置
          </button>
          <button
            className={`px-4 py-2 text-xs font-medium transition-colors ${tabKey === 'proxy' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            onClick={() => handleTabChange('proxy')}
          >
            代理配置
          </button>
        </div>
        {/* 页签内容容器 */}
        <div className="flex-1 relative overflow-hidden">
          {/* Mock 数据配置页面 */}
          {loadedTabs.mock && (
            <div className={`absolute inset-0 flex flex-col box-border overflow-hidden transition-all duration-300 ease-in-out ${tabKey === 'mock' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
              <MockerConfig />
            </div>
          )}
          {/* 代理配置页面 */}
          {loadedTabs.proxy && (
            <div className={`absolute inset-0 flex flex-col box-border overflow-hidden transition-all duration-300 ease-in-out ${tabKey === 'proxy' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
              <ProxyConfig />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
