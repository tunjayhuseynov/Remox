import '../dist/index.css'
import '@celo/react-celo/lib/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import Wallet from 'components/Wallet'
import store from 'redux/store';
import { ReactElement, ReactNode, useEffect } from 'react';
import { NextPage } from 'next';
import { ThemeProvider } from "next-themes";

import App from 'layouts/App'
import Guard from 'layouts/Guard';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from 'firebaseConfig';
import { useRouter } from 'next/dist/client/router';


const DashboardLayout = dynamic(() => import('layouts/dashboard'))


type NextPageWithLayout = NextPage & {
  disableLayout?: (page: ReactElement) => ReactNode
  disableGuard?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}



function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
  const url = `${router.route}`

  const route = useRouter()
  // const [mode, setMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (!router.route.includes('/requests/[[...request]]')) {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          route.push('/')
        }
      })
    }
  }, [])


  const disableLayout = Component?.disableLayout ?? false
  const disableGuard = Component?.disableGuard ?? false
  return <ThemeProvider enableSystem={false} attribute="class">
    <Head>
      <title>Remox - Simplified and Collaborative Treasury  Management for DAOs</title>
    </Head>
    <Provider store={store}>
      <ToastContainer />
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
                      <Component {...pageProps} canonical={url} key={url} />
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
