import { Fragment } from "react/jsx-runtime"
import { useGlobalProxyStore, type MessageItem } from "@/models"
import { svgIcons, iconTypeColor } from '@/assets/icon';

export const Message = () => {
  const { state } = useGlobalProxyStore()
  const messageList = state.messageList
  if (Array.isArray(messageList) && messageList.length) {
    return <div className='fixed inset-0 flex flex-col items-center z-90 gap-2 py-2 box-border pointer-events-none' >
      {messageList.map((item: MessageItem) => {
        const Icon = svgIcons[item.type];
        const color = iconTypeColor[item.type];
        return <div
          key={item.id}
          className='shadow-md py-2 px-4 box-border rounded-lg bg-white text-xs flex items-center gap-2 flex-wrap'
        >
          {Icon ? <Icon className={color} /> : <Fragment />}
          <div>{item.message}</div>
        </div>
      })}
    </div>
  } else {
    return <Fragment />
  }
}