import ReactDOM from 'react-dom/client';
import Root from './pages/index';
import './index.css';
import { GlobalProxyProvider } from "./models"
import { Message } from "@/components/message"

// const onDemo = () => {
//   const socket = new WebSocket('ws://localhost:8080');
//   socket.onmessage = function (msg) { console.log(msg) };       // listen to socket messages
//   socket.onopen = () => {
//     socket.send('hello world');       // send message
//   }
// }

// const onDemo2 = () => {
//   const socket = new WebSocket('ws://localhost:6901/ws');
//   socket.onmessage = function (msg) { console.log(msg) };       // listen to socket messages
//   socket.onopen = () => {
//     socket.send('hello world');       // send message
//   }
// }

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<GlobalProxyProvider>
    {/* <div className='flex gap-3'>
      <button className='w-3 bg-green-500' onClick={onDemo} >1</button>
      <button className='w-3 bg-green-500' onClick={onDemo2} >2</button>
    </div> */}

    <Root />
    <Message />
  </GlobalProxyProvider>);
}
