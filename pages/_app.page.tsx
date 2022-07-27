import '../dist/index.css'
import '@celo-tools/use-contractkit/lib/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import Wallet from 'components/Wallet'
import store from 'redux/store';
import { ReactElement, ReactNode, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { ThemeProvider } from "next-themes";
import { ThemeProvider as MuiTheme, useTheme, createTheme } from '@mui/material/styles';


import App from 'layouts/App'
import Guard from 'layouts/Guard';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
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

  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );


  const disableLayout = Component?.disableLayout ?? false
  const disableGuard = Component?.disableGuard ?? false
  return <ThemeProvider enableSystem={false} attribute="class">
    <MuiTheme theme={theme}>

      <Head>
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={"anonymous"} />
          <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600&display=swap" rel="stylesheet"></link>
        </>
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
    </MuiTheme>
  </ThemeProvider>
}

export default MyApp
