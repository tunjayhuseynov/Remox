import { StrictMode } from 'react';
import { render } from 'react-dom';
import './dist/index.css';
import App from './App';
import { ContractKitProvider, Mainnet } from '@celo-tools/use-contractkit';
import '@celo-tools/use-contractkit/lib/styles.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';

render(
  <StrictMode>
    <ContractKitProvider
      dapp={{
        name: 'My awesome dApp',
        icon: "http://localhost:3000/favicon.png",
        description: 'My awesome description',
        url: 'http://localhost:3000',
      }}
      networks={[Mainnet]}
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
