import ReactDOM from 'react-dom/client';
import Root from './pages/index';
import './index.css';
import { GlobalProxyProvider } from "./models"
import { Message } from "@/components/message"

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<GlobalProxyProvider>
    <Root />
    <Message />
  </GlobalProxyProvider>);
}
