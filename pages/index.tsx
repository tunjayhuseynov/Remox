import { useFirestoreSearchField } from 'rpcHooks/useFirebase';
import { auth, IBudgetExercise, IUser } from 'firebaseConfig';
import { PROVIDERS } from "@celo-tools/use-contractkit";
import { useWalletKit } from 'hooks'
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { selectDarkMode } from 'redux/slices/notificationSlice';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { updateBlockchain } from 'redux/slices/account/network';
import { CoinsURL, DropDownItem } from 'types';
import Dropdown from 'components/general/dropdown';
import Button from 'components/button';
import useOneClickSign from 'hooks/walletSDK/useOneClickSign';
import { changeAccount, changeExisting, } from 'redux/slices/account/selectedAccount';
import { isIndividualExisting, isOldUser } from 'hooks/singingProcess/utils';
import useLoading from 'hooks/useLoading';
import useNextSelector from 'hooks/useNextSelector';
import { selectStorage, setStorage } from 'redux/slices/account/storage';
import type { BlockchainType } from 'hooks/walletSDK/useWalletKit';
import useIndividual from 'hooks/accounts/useIndividual';
import { fetchBudgetExercise } from 'redux/slices/account/budgets';
import { setBlockchain, setProviderAddress } from 'redux/slices/account/remoxData';

const Home = () => {
  const { Connect, Address } = useWalletKit();
  const { processSigning } = useOneClickSign()
  const dark = useNextSelector(selectDarkMode)
  const navigate = useRouter()
  const dispatch = useAppDispatch()
  const { blockchain } = navigate.query as { blockchain?: string | undefined }

  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => setAddress(Address), [Address])

  const [selected, setSelected] = useState<DropDownItem>(
    { name: blockchain?.split("").reduce((a, c, i) => { if (i === 0) { return a.toUpperCase() + c } return a + c }, '') ?? "Celo", address: blockchain ?? "celo", coinUrl: blockchain === "celo" || !blockchain ? CoinsURL.CELO : CoinsURL.SOL }
  )

  const { individual, isIndividualFetching: isIndividualFetched } = useIndividual(address ?? "0", (selected.address as BlockchainType) ?? "celo")


  useEffect(() => {
    dispatch(updateBlockchain(selected.address! as BlockchainType))
    if (selected.address) {
      localStorage.setItem("blockchain", selected.address)
    }
  }, [selected])

  useEffect(() => {
    const key = PROVIDERS["Private key"]
    key.description = "Sign into Poof.cash with your private key";
    key.name = "Poof.cash";
    key.icon = "https://poof.cash/images/LogoMark.svg";
  }, [])

  const connectEvent = async () => {
    try {
      if (!address) {
        await Connect()
      }
      else if (address) {
        // Kohne userleri unlock sehfesine yonlendirmek ucundur
        const user = await isOldUser(address)
        if (user) return navigate.push("/unlock")
        if (auth.currentUser === null) return await processSigning(address);

        dispatch(setProviderAddress(address));
        dispatch(setBlockchain(selected.address as BlockchainType))
        if (individual) {
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
        <div className="w-[12.5rem] sm:w-[25rem] flex flex-col items-center justify-center gap-10">
          <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" className="w-full" />
          <span className="font-light text-greylish text-center">Contributor and Treasury Management Platform</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-14">
          <Dropdown className={"border !border-primary w-[200px]"} childClass={`!border-primary mt-1 !text-center`} selected={selected} disableAddressDisplay={true} onSelect={setSelected} list={[{ name: "Solana", address: "solana", coinUrl: CoinsURL.SOL }, { name: "Celo", address: "celo", coinUrl: CoinsURL.CELO }]} />
          {<Button onClick={ConnectEvent} isLoading={isLoading || isIndividualFetched}>{address ? auth.currentUser !== null ? "Enter App" : "Provider Sign" : "Connect to a wallet"}</Button>}
        </div>
      </div>
    </section>
  </>
}

Home.disableLayout = true
Home.disableGuard = true

export default Home
