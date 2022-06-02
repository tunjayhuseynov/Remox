import '../dist/index.css'
import '@celo-tools/use-contractkit/lib/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import Wallet from 'components/Wallet'
import store from 'redux/store';
import { ReactElement, ReactNode, useEffect, useLayoutEffect } from 'react';
import DashboardLayout from 'layouts/dashboard';
import { NextPage } from 'next';
import { ThemeProvider } from "next-themes";

import App from 'layouts/App'
import Guard from 'layouts/Guard';
import { UploadImageForUser } from 'hooks/singingProcess/utils';

type NextPageWithLayout = NextPage & {
  disableLayout?: (page: ReactElement) => ReactNode
  disableGuard?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {

  const disableLayout = Component?.disableLayout ?? false
  const disableGuard = Component?.disableGuard ?? false
  return <ThemeProvider enableSystem={false} attribute="class">
    <Provider store={store}>
      <Wallet>
        <App>
          {
            disableGuard ?
              <Component {...pageProps} />
              :
              <Guard>
                {
                  disableLayout ?
                    <Component {...pageProps} /> :
                    <DashboardLayout>
                      <Component {...pageProps} />
                    </DashboardLayout>

                }
              </Guard>
          }
        </App>
      </Wallet>
    </Provider>
  </ThemeProvider>
}

export default MyApp
