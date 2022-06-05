import { useFirestoreSearchField } from 'apiHooks/useFirebase';
import { IUser } from 'firebaseConfig';
import { PROVIDERS } from "@celo-tools/use-contractkit";
import { useWalletKit } from 'hooks'
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { selectDarkMode } from 'redux/reducers/notificationSlice';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BlockChainTypes, updateBlockchain } from 'redux/reducers/network';
import { CoinsURL, DropDownItem } from 'types';
import Dropdown from 'components/general/dropdown';
import Button from 'components/button';
import useOneClickSign from 'hooks/walletSDK/useOneClickSign';

const Home = () => {
  const { Connect, Address } = useWalletKit();
  const { processSigning } = useOneClickSign()
  const { search, isLoading } = useFirestoreSearchField<IUser>()
  const dark = useAppSelector(selectDarkMode)
  const navigate = useRouter()
  const dispatch = useAppDispatch()
  const { blockchain } = navigate.query as { blockchain?: string | undefined }

  const [address, setAddress] = useState<string | null>(null)
  const [Dark, setDark] = useState<boolean | null>(null)

  useEffect(() => setDark(dark), [dark])
  useEffect(() => setAddress(Address), [Address])

  const [selected, setSelected] = useState<DropDownItem>(
    { name: blockchain?.split("").reduce((a, c, i) => { if (i === 0) { return a.toUpperCase() + c } return a + c }, '') ?? "Celo", address: blockchain ?? "celo", coinUrl: blockchain === "celo" || !blockchain ? CoinsURL.CELO : CoinsURL.SOL }
  )

  useEffect(() => {
    dispatch(updateBlockchain(selected.address! as BlockChainTypes))
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
        const user = await search("users", [{
          field: 'address',
          searching: address,
          indicator: "array-contains"
        }])

        if (user) {
          navigate.push('/choose-type')
        } else {
          await processSigning(address);
          navigate.push('/choose-type')

        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  return <>
    <section className="flex justify-center items-center w-full h-screen">
      <div className="w-[50rem] h-[37.5rem] bg-[#eeeeee] dark:bg-darkSecond bg-opacity-40 flex flex-col justify-center items-center gap-14">
        <div className="w-[12.5rem] sm:w-[25rem] flex flex-col items-center justify-center gap-10">
          <img src={Dark ? "/logo.png" : "/logo_white.png"} alt="" className="w-full" />
          <span className="font-light text-greylish text-center">Contributor and Treasury Management Platform</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-14">
          <Dropdown className={"border !border-primary w-[200px]"} childClass={`!border-primary mt-1 !text-center`} selected={selected} disableAddressDisplay={true} onSelect={setSelected} list={[{ name: "Solana", address: "solana", coinUrl: CoinsURL.SOL }, { name: "Celo", address: "celo", coinUrl: CoinsURL.CELO }]} />
          {<Button onClick={connectEvent} isLoading={isLoading}>{address ? "Enter App" : "Connect to a wallet"}</Button>}
        </div>
      </div>
    </section>
  </>
}

Home.disableLayout = true
Home.disableGuard = true

export default Home
