import { Fragment, useMemo } from 'react';
import MockerConfig from './mocker';
import ProxyConfig from './proxy';
import { useGlobalProxyStore } from "@/models"

export default function Root() {
  const { state, dispatch } = useGlobalProxyStore()

  const tabKey = state.tabKey

  const mockRender = useMemo(() => {
    return <MockerConfig />
  }, [])

  const proxyRender = useMemo(() => {
    return <ProxyConfig />
  }, [])

  /**是否存在服务端*/
  return (
    <div className="h-full bg-zinc-50 dark:bg-black p-4 sm:p-6 box-border overflow-hidden flex flex-col">
      <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 box-border flex flex-col overflow-auto">
        {/* 页面切换选项卡 */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
          <button
            className={`px-4 py-2 text-xs font-medium transition-colors ${tabKey === 'mock' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            onClick={() => dispatch({ tabKey: 'mock' })}
          >
            Mocker 数据配置
          </button>
          <button
            className={`px-4 py-2 text-xs font-medium transition-colors ${tabKey === 'proxy' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            onClick={() => dispatch({ tabKey: 'proxy' })}
          >
            代理配置
          </button>
        </div>
        {/* Mock 数据配置页面 */}
        {tabKey === 'mock' ? mockRender : <Fragment />}
        {/* 代理配置页面 */}
        {tabKey === 'proxy' ? proxyRender : <Fragment />}
      </div>
    </div>
  );
}
