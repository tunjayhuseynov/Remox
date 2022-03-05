import { StrictMode } from 'react';
import { render } from 'react-dom';
import './dist/index.css';
import App from './App';
import { ContractKitProvider, Mainnet, Alfajores } from '@celo-tools/use-contractkit';
import '@celo-tools/use-contractkit/lib/styles.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import { BaseUrl } from 'utils/const';

render(
  <StrictMode>
    <ContractKitProvider
      dapp={{
        name: 'Remox DAO',
        icon: `${BaseUrl}/favicon.png`,
        description: 'Remox - Contributor and Treasury Management Platform',
        url: `${BaseUrl}`,
      }}
      networks={[Mainnet, Alfajores]}
    >
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ContractKitProvider>
  </StrictMode>,
  document.getElementById('root')
);
