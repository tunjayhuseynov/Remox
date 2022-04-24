import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import { useContractKit, PROVIDERS, localStorageKeys, useContractKitContext, WalletTypes } from "@celo-tools/use-contractkit";
import { useFirestoreSearchField } from "../API/useFirebase";
import { IUser } from "Firebase";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import { useEffect, useState } from "react";
import { changePrivateToken } from "redux/reducers/selectedAccount";
import Dropdown from "components/general/dropdown";
import { CoinsURL, DropDownItem } from "types";
import { BlockChainTypes, updateBlockchain } from "redux/reducers/network";
import { useWalletKit } from "hooks";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { IoIosArrowDown } from 'react-icons/io';
import { newBlockchainParameters } from "@celo/contractkit/lib/generated/BlockchainParameters";


const Home = ({ blockchain }: { blockchain: string | null }) => {
    const { Connect, Address } = useWalletKit();
    const { search, isLoading } = useFirestoreSearchField<IUser>()
    const dark = useAppSelector(selectDarkMode)
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [ctx, setState] = useContractKitContext()
    // const [isOpen, setOpen] = useState(false)
    // const [value, setValue] = useState<string>()



    const [selected, setSelected] = useState<DropDownItem>(
        { name: blockchain?.split("").reduce((a, c, i) => { if (i === 0) { return a.toUpperCase() + c } return a + c }, '') ?? "Celo", address: blockchain ?? "celo", coinUrl: blockchain === "celo" || !blockchain ? CoinsURL.CELO : CoinsURL.SOL }
    )

    useEffect(() => {
        dispatch(updateBlockchain(selected.address! as BlockChainTypes))
        if (selected.address) {
            localStorage.setItem("blockchain", selected.address)
        }
        // if (blockchain){
        //     setValue(blockchain) 
        //    }
    }, [selected])

    useEffect(() => {
        const key = PROVIDERS["Private key"]
        key.description = "Sign into Poof.cash with your private key";
        key.name = "Poof.cash";
        key.icon = "https://poof.cash/images/LogoMark.svg";
    }, [])

    const connectEvent = async () => {
        try {
            if (!Address) {
                await Connect()
                if (localStorage.getItem(localStorageKeys.lastUsedWalletType) === "PrivateKey") {
                    // const str = localStorage.getItem(localStorageKeys.lastUsedWalletArguments)
                    // if (str) {
                    //     const key = JSON.parse(str)

                    //     if (key[0] !== "GoldToken") {
                    //         kit.addAccount(key[0])
                    //         const accounts = kit.getWallet()?.getAccounts()
                    //         if (accounts) {
                    //             kit.defaultAccount = accounts[0]
                    //             const connector = ctx.connector;
                    //             connector.type = WalletTypes.PrivateKey;
                    //             search("users", 'address', accounts[0], "array-contains")
                    //                 .then(user => {
                    //                     dispatch(changePrivateToken(key[0]))
                    //                     setState("setConnector", connector)
                    //                     setState("setAddress", accounts[0])
                    //                 })
                    //         }
                    //     }
                    // }
                }
            }
            else if (Address) {
                search("users", 'address', Address, "array-contains")
                    .then(user => {
                        if (user) {
                            navigate('/unlock')
                        } else {
                            navigate('/create-account')
                        }

                    })
            }
        } catch (error) {
            console.error(error)
        }
    }

    return <>
        <section className="flex justify-center items-center w-full h-screen">
            <div className="w-[50rem] h-[37.5rem] bg-[#eeeeee] dark:bg-darkSecond bg-opacity-40 flex flex-col justify-center items-center gap-14">
                <div className="w-[12.5rem] sm:w-[25rem] flex flex-col items-center justify-center gap-10">
                    <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" className="w-full" />
                    <span className="font-light text-greylish text-center">Contributor and Treasury Management Platform</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-14">
                    <Dropdown className={"border !border-primary w-[200px]"} childClass={`!border-primary mt-1 !text-center`} selected={selected} disableAddressDisplay={true} onSelect={setSelected} list={[{ name: "Solana", address: "solana", coinUrl: CoinsURL.SOL }, { name: "Celo", address: "celo", coinUrl: CoinsURL.CELO }]} />
                    {<Button onClick={connectEvent} isLoading={isLoading}>{Address ? "Enter App" : "Connect to a wallet"}</Button>}
                </div>
            </div>
        </section>
    </>

};

export default Home;