import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import { PROVIDERS, useContractKitContext } from "@celo-tools/use-contractkit";
import { useFirestoreSearchField } from "../API/useFirebase";
import { IUser } from "firebaseConfig";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import { useEffect, useState } from "react";
import Dropdown from "components/general/dropdown";
import { CoinsURL, DropDownItem } from "types";
import { BlockChainTypes, updateBlockchain } from "redux/reducers/network";
import { useWalletKit } from "hooks";


const Home = ({ blockchain }: { blockchain: string | null }) => {
    const { Connect, Address } = useWalletKit();
    const { search, isLoading } = useFirestoreSearchField<IUser>()
    const dark = useAppSelector(selectDarkMode)
    const navigate = useNavigate()
    const dispatch = useAppDispatch()



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
            if (!Address) {
                await Connect()
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