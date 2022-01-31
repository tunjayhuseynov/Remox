import PhraseBar from '../components/phraseBar';
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { selectStorage } from '../redux/reducers/storage';
import { setUnlock } from '../redux/reducers/unlock';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import Button from '../components/button';
import useSignInOrUp from '../hooks/useSignInOrUp';
import { useContractKit } from '@celo-tools/use-contractkit';

const Unlock = () => {
    const { address } = useContractKit();
    const storage = useAppSelector(selectStorage)
    const { executeSign, isLoading } = useSignInOrUp()

    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement>(null)

    const router = useNavigate()
    const [incorrrect, setIncorrect] = useState(false)

    const Submit = async () => {
        if (inputRef.current && address) {
            setIncorrect(false);

            try {
                await executeSign(address, inputRef.current.value)

                dispatch(setUnlock(true))
                router('/dashboard');
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
                <img src="/logo.png" alt="" className="w-[150px]" />
            </div>
        </header>
        <section className="flex flex-col justify-center items-center h-screen gap-8">
            <h2 className="text-3xl text-primary">Unlock Your Wallet</h2>
            <div className="flex flex-col gap-3">
                <div>Public Address</div>
                {address && <PhraseBar address={address} scanIcon={false} />}
            </div>
            <div className="flex flex-col gap-4">
                <div>Enter your password to unlock your wallet</div>
                <div className="flex justify-center"><input onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        Submit()
                    }
                }} ref={inputRef} type="password" autoComplete='new-password' autoFocus className="bg-greylish bg-opacity-10 px-3 py-2 rounded-lg outline-none" /></div>
                {incorrrect && <div className="text-red-600 text-center">Password is Incorrect</div>}
                <div className="flex justify-center">
                    <Button onClick={Submit} className="px-5 py-2" isLoading={isLoading}>Unlock</Button>
                </div>
            </div>
        </section>
    </>
}


export default Unlock;