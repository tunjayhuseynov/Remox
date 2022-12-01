import { auth } from 'firebaseConfig';
import { useWalletKit } from 'hooks'
import { useAppDispatch } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Button from 'components/button';
import useOneClickSign from 'hooks/walletSDK/useOneClickSign';
import useLoading from 'hooks/useLoading';
import useNextSelector from 'hooks/useNextSelector';
import { setBlockchain, setIndividual, setProviderAddress } from 'redux/slices/account/remoxData';
import { Get_Individual } from 'crud/individual';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { Blockchains, BlockchainType } from 'types/blockchains';
import Image from 'next/image'
import dynamic from 'next/dynamic';
import { useCelo } from '@celo/react-celo';
import { NETWORKS } from 'components/Wallet';

const Dropdown = dynamic(() => import('components/general/dropdown'), {
  ssr: false
})

const Home = () => {
  const { Connect, Disconnect } = useWalletKit();
  const { walletChainId, networks, network, address, updateNetwork, connect, disconnect } = useCelo()
  const [selected, setSelected] = useState(
    Blockchains?.find(s => s.name === blockchain) ?? Blockchains[0],
  )

  const { processSigning } = useOneClickSign(selected)
  const dark = useNextSelector(SelectDarkMode)
  const navigate = useRouter()
  const dispatch = useAppDispatch()
  const { blockchain } = navigate.query as { blockchain?: string | undefined }

  const [buttonText, setButtonText] = useState("Connect to a wallet")
  const ref = useRef(0)

  useAsyncEffect(async () => {
    setButtonText(address ? auth.currentUser !== null ? "Enter App" : "Sign and Allow" : "Connect to a wallet")
  }, [address])


  useEffect(() => {
    if (selected) {
      dispatch(setBlockchain(selected as BlockchainType))
    }
  }, [selected])

  useAsyncEffect(async () => {
    if (selected) {
      await disconnect()
    }
  }, [selected])

  useAsyncEffect(async () => {
    if (address && ref.current === 0) {
      await disconnect()
    }
    ref.current++;
  }, [address])

  const connectEvent = async () => {
    try {
      if (walletChainId != selected.chainId) {
        await updateNetwork(networks.find(s => s.chainId === selected.chainId)!)
      }

      if (!address) {
        console.log("No address");
        await connect()
      }
      else if (address) {
        // // Kohne userleri unlock sehfesine yonlendirmek ucundur
        // const user = await isOldUser(address)
        // if (user) return navigate.push("/unlock")
        await processSigning(address);
        if (auth.currentUser === null) return;
        dispatch(setProviderAddress(address));
        dispatch(setBlockchain(selected as BlockchainType))

        const individual = await Get_Individual(auth.currentUser.uid)
        if (individual) {
          dispatch(setIndividual(individual))
          navigate.push('/choose-type')
        }
        else {
          navigate.push('/create-account')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const [isLoading, ConnectEvent] = useLoading(connectEvent)

  return <>
    <section className="flex justify-center items-center w-full h-screen">
      <div className="w-[50rem] h-[37.5rem] bg-[#eeeeee] dark:bg-darkSecond bg-opacity-40 flex flex-col justify-center items-center gap-14">
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="w-[25rem]">
            <Image src={dark ? "/logo_beta.svg" : "/logo_white_beta.svg"} alt="Remox DAO" layout='responsive' height={50} width={200} />
          </div>
          <span className="font-semibold text-greylish text-center text-lg tracking-wider">Simplified and Collaborative Treasury Management</span>
        </div>
        <div className="flex flex-col items-center justify-center space-y-8">
          <Dropdown
            // className={"w-full"}
            sx={{
              height: "2.5rem",
              width: "12rem",
            }}
            label="Network"
            selected={selected}
            setSelect={setSelected as any}
            list={Blockchains}
          />
          <Button onClick={ConnectEvent} className={"w-[12rem] text-xs !px-0"} isLoading={isLoading}>{buttonText}</Button>
        </div>
      </div>
    </section>
  </>
}

Home.disableLayout = true
Home.disableGuard = true

export default Home
