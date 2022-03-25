import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { removeStorage } from '../redux/reducers/storage';
import { setUnlock } from '../redux/reducers/unlock';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import Button from '../components/button';
import useSignInOrUp from '../hooks/useSignInOrUp';
import { useContractKit } from '@celo-tools/use-contractkit';
import { setMenu } from 'redux/reducers/toggles';
import { removeTransactions } from 'redux/reducers/transactions';
import { selectDarkMode } from 'redux/reducers/notificationSlice';
import { ToastRun } from 'utils/toast';

const Unlock = () => {
    const location = useLocation()
    const { address, destroy, initialised } = useContractKit();
    const { executeSign, isLoading } = useSignInOrUp()
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement>(null)
    const dark = useAppSelector(selectDarkMode)

    const router = useNavigate()
    const [incorrrect, setIncorrect] = useState(false)


    const Submit = async () => {
        if (!initialised) {
            dispatch(setMenu(false))
            dispatch(removeTransactions())
            ToastRun(<div className="dark:text-white"><strong>You've not signed in yet</strong> <br /> Please, sign in first</div>)
        }
        if (inputRef.current && address && initialised) {
            setIncorrect(false);

            try {
                await executeSign(address, inputRef.current.value)

                dispatch(setUnlock(true))
                router(location.search && location.search.split("=")[1].includes("/dashboard") ? location.search.split("=")[1] : '/dashboard');
            } catch (error) {
                setIncorrect(true);
                console.error(error)
                if (error === "No Data In Users") {
                    localStorage.removeItem('remoxUser')
                    router('/')
                }
            }
        }
    }

    return <>
        <header className="flex md:px-40 h-[75px] justify-center md:justify-start items-center absolute top-0 w-full">
            <div>
                <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
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
                    <Button version='second' className="px-5 !py-2 w-32" onClick={() => {
                        dispatch(setMenu(false))
                        dispatch(removeTransactions())
                        dispatch(removeStorage())
                        destroy()
                        router('/')
                    }}>Logout</Button>
                    <Button onClick={Submit} className="px-5 !py-2 w-32" isLoading={isLoading}>Login</Button>
                </div>
            </div>
        </section>
    </>
}


export default Unlock;