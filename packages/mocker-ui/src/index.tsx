import ReactDOM from 'react-dom/client';
import Pages from './pages';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<Pages />);
}
