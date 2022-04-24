import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Wallet from './Wallet';
import '@celo-tools/use-contractkit/lib/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import '@solana/wallet-adapter-react-ui/styles.css';

const root = createRoot(
  document.getElementById('root')!
);

root.render(
  <StrictMode>
    <Wallet>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </Wallet>
  </StrictMode>
)
