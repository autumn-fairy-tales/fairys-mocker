
import { createCommonMainStore, ProxyInstanceObject, ref, type ProxyInstanceObjectStoreType } from "@carefrees/valtio"
import { type IconType } from '../assets/icon';

export interface MessageItem {
  /**类型*/
  type: IconType
  /**消息*/
  message: React.ReactNode
  /**唯一值*/
  id: string
}

export interface GlobalState extends ProxyInstanceObjectStoreType {
  /**页签*/
  tabKey: "mock" | "proxy"
  /**页面整体消息弹框*/
  messageList: MessageItem[]
  /**服务是否在线*/
  isServer?: boolean
}

class Global extends ProxyInstanceObject<GlobalState> {
  open = (type: IconType, message: React.ReactNode, duration = 3000) => {
    const id = new Date().valueOf().toString();
    this.store.messageList.push(ref({ type, message, id: id }));
    const timer = setTimeout(() => {
      this.store.messageList = this.store.messageList.filter(item => item.id !== id);
      clearTimeout(timer);
    }, duration);
  }
}

const proxyInstance = new Global()._ctor({
  tabKey: "mock",
  messageList: [],
  isServer: true,
})

const { MainProxyProvider, useMainProxyStore } = createCommonMainStore<GlobalState, Global>({ proxyInstance, namespace: "global" })

export const GlobalProxyProvider = MainProxyProvider
export const useGlobalProxyStore = useMainProxyStore
