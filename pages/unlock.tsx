import Button from "components/button";
import { useSignInOrUp, useWalletKit } from "hooks";
import useOneClickSign from "hooks/walletSDK/useOneClickSign";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/slices/notificationSlice";
import { removeStorage } from "redux/slices/account/storage";
import { removeTransactions } from "redux/slices/account/transactions";
import { setUnlock } from "redux/slices/unlock";
import { ToastRun } from "utils/toast";

const Unlock = () => {
    const { Address, Disconnect, Connected, setBlockchainAuto } = useWalletKit();
    // const { executeSign, isLoading } = useSignInOrUp()
    const { processSigning } = useOneClickSign()
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement>(null)
    const dark = useSelector(selectDarkMode)

    const [Dark, setDark] = useState<boolean | null>(null)
    useEffect(() => setDark(dark), [dark])

    const router = useRouter()
    const { search } = router.query as { search: string | undefined }
    const [incorrrect, setIncorrect] = useState(false)


    const Submit = async () => {
        const address = await Address
        if (!Connected && !Address) {
            dispatch(removeTransactions())
            ToastRun(<div className="dark:text-white"><strong>You&apos;ve not signed into your wallet yet</strong> <br /> Please, sign in first</div>, "error")
        }
        if (inputRef.current && address && Connected) {
            setIncorrect(false);

            try {
                // await executeSign(Address, inputRef.current.value)
                await processSigning(address!, inputRef.current.value)
                setBlockchainAuto()
                dispatch(setUnlock(true))
                router.push(search && search.split("=")[1].includes("/dashboard") ? search.split("=")[1] : '/dashboard');
            } catch (error) {
                setIncorrect(true);
                console.error(error)
                if (error === "No Data In Users") {
                    localStorage.removeItem('remoxUser')
                    router.push('/')
                }
            }
        }
    }

    return <>
        <header className="flex md:px-40 h-[75px] justify-center md:justify-start items-center absolute top-0 w-full">
            <div>
                <img src={Dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
            </div>
        </header>
        <section className="flex flex-col justify-center items-center h-screen gap-16 min-w-[300px]">
            <h2 className="text-4xl font-semibold">Unlock Your Wallet/<span className="text-primary">Login</span></h2>
            {/* <div className="flex flex-col gap-3">
                <div>Public Address</div>
                {address && <PhraseBar address={address} scanIcon={false} />}
            </div> */}
            <div className="flex flex-col gap-4 ">
                <div className="text-center">Enter password to unlock the wallet</div>
                <div className="flex justify-center"><input onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        Submit()
                    }
                }} ref={inputRef} type="password" autoComplete='new-password' autoFocus className="bg-greylish dark:bg-darkSecond bg-opacity-10 px-3 py-3 rounded-lg outline-none w-full" /></div>
                {incorrrect && <div className="text-red-600 text-center">Password is Incorrect</div>}
                <div className="grid grid-cols-2 justify-center gap-x-5">
                    <Button version='second' className="px-5 !py-2 w-32" onClick={async () => {
                        dispatch(removeTransactions())
                        dispatch(removeStorage())
                        await Disconnect()
                        router.push('/')
                    }}>Logout</Button>
                    <Button onClick={Submit} className="px-5 !py-2 w-32" isLoading={false}>Login</Button>
                </div>
            </div>
        </section>
    </>
}
Unlock.disableLayout = true
Unlock.disableGuard = true
export default Unlock