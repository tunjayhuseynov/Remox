import { StrictMode } from 'react';
import { render } from 'react-dom';
import './dist/index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Wallet from 'Wallet';
import '@celo-tools/use-contractkit/lib/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
require('@solana/wallet-adapter-react-ui/styles.css');

render(
  <StrictMode>
    <Wallet>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </Wallet>
  </StrictMode>,
  document.getElementById('root')
);
