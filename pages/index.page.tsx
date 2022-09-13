import { auth } from 'firebaseConfig';
import { useWalletKit } from 'hooks'
import { useAppDispatch } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Dropdown from 'components/general/dropdown';
import Button from 'components/button';
import useOneClickSign from 'hooks/walletSDK/useOneClickSign';
import { isOldUser } from 'hooks/singingProcess/utils';
import useLoading from 'hooks/useLoading';
import useNextSelector from 'hooks/useNextSelector';
import { setBlockchain, setIndividual, setProviderAddress } from 'redux/slices/account/remoxData';
import { Get_Individual } from 'crud/individual';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { Blockchains, BlockchainType } from 'types/blockchains';
import Image from 'next/image'

const Home = () => {
  const { Connect, Address } = useWalletKit();
  const { processSigning } = useOneClickSign()
  const dark = useNextSelector(SelectDarkMode)
  const navigate = useRouter()
  const dispatch = useAppDispatch()
  const { blockchain } = navigate.query as { blockchain?: string | undefined }

  const [buttonText, setButtonText] = useState("Connect to a wallet")

  useAsyncEffect(async () => {
    const address = await Address
    setButtonText(address ? auth.currentUser !== null ? "Enter App" : "Provider Sign" : "Connect to a wallet")
  }, [Address])

  const [selected, setSelected] = useState(
    Blockchains?.find(s => s.name === blockchain) ?? Blockchains[0],
  )

  useEffect(() => {
    if (selected) {
      dispatch(setBlockchain(selected as BlockchainType))
    }
  }, [selected])

  const connectEvent = async () => {
    try {
      const address = await Address
      if (!address) {
        console.log("No address");
        await Connect()
      }
      else if (address) {
        // Kohne userleri unlock sehfesine yonlendirmek ucundur
        const user = await isOldUser(address)
        if (user) return navigate.push("/unlock")
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
            <Image src={dark ? "/logo.png" : "/logo_white.png"} alt="Remox DAO" layout='responsive' height={50} width={200}/>
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
            label="Blockchain"
            selected={selected}
            setSelect={setSelected}
            list={Blockchains}
          />
          <Button onClick={ConnectEvent} className={"w-[12rem] text-sm px-0"} isLoading={isLoading}>{buttonText}</Button>
        </div>
      </div>
    </section>
  </>
}

Home.disableLayout = true
Home.disableGuard = true

export default Home
