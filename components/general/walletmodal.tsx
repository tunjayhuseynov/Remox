import { useEffect, useRef, useState, forwardRef, RefObject, SetStateAction, Dispatch, LegacyRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'components/general/dropdown';
import Modal from 'components/general/modal';
import { changeError, changeSuccess } from 'redux/reducers/notificationSlice';
import { changeAccount, SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import { DropDownItem } from 'types';
import Button from 'components/button';
import useMultisig, { SolanaMultisigData } from 'hooks/walletSDK/useMultisig';
import useMultiWallet from 'hooks/useMultiWallet';
import { WordSplitter } from 'utils';
import { useRouter } from 'next/router';
import { useWalletKit } from 'hooks';
import Paydropdown from "subpages/pay/paydropdown";
import { motion, AnimatePresence } from "framer-motion"

function Walletmodal({ setNotify2,setNotify, openNotify, setItem, selectedItem, paymentname, paymentname2, selectedPayment, selectedPayment2, setSelectedPayment2, setSelectedPayment }: { paymentname: DropDownItem[], paymentname2: DropDownItem[], selectedPayment: DropDownItem, selectedPayment2: DropDownItem, setItem: React.Dispatch<SetStateAction<DropDownItem>>, selectedItem: DropDownItem, setSelectedPayment: React.Dispatch<SetStateAction<DropDownItem>>, setSelectedPayment2: React.Dispatch<SetStateAction<DropDownItem>>,setNotify: React.Dispatch<SetStateAction<boolean>>, setNotify2: React.Dispatch<SetStateAction<boolean>>, openNotify: boolean }) {
    const { Disconnect, blockchain } = useWalletKit()
    const { data, importMultisigAccount, isLoading } = useMultisig()
    const navigator = useRouter()
    const selectedAccount = useSelector(SelectSelectedAccount)
    const { addWallet, data: wallets, Wallet, walletSwitch } = useMultiWallet()

    const [list, setList] = useState<DropDownItem[]>([])
    const dispatch = useDispatch()
    const [isAccountModal, setAccountModal] = useState(false)


    useEffect(() => {
        if (openNotify) {
            document.querySelector('main')!.style.transform = "translateX(-100%)"
            document.querySelector('main')!.style.transition = "transform 1s ease-out"
            document.querySelector('body')!.style.overflowY = "hidden"
        } else {
            document.querySelector('main')!.style.transform = "translateX(0)"
            document.querySelector('main')!.style.transition = "transform 1s ease-out"
            document.querySelector('body')!.style.overflowY = ""           
        }


    }, [openNotify])

    // type Props = { onDisable: React.Dispatch<SetStateAction<boolean>>, setModals: React.Dispatch<SetStateAction<boolean>>, setNotify: React.Dispatch<SetStateAction<boolean>>, openNotify: boolean };
    // type Ref = HTMLDivElement

    // const ForwardButton = forwardRef<Ref, Props>((props, ref) => {
    //     return <div className="w-full" ref={ref} onClick={() => { props.setNotify(!props.openNotify) }}>
    //         <Button type="submit" className={'!py-2 px-10 w-full rounded-xl'} onClick={() => { props.setModals(true); props.onDisable(false) }}>Next</Button>
    //     </div>
    // })

    useEffect(() => {
        setList([
            { name: "Treasury vault 0", totalValue: '$2,800', photo: "nftmonkey" },
            { name: "Treasury vault 1", totalValue: '$3,700', photo: "" },
            { name: "Add Organization", onClick: () => { navigator.push('/create-organization') } }
        ])
    }, [])

    return <>
         <AnimatePresence> {openNotify &&
                <motion.div initial={{ x: "100%"}} animate={{ x: 15 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 1}} className="bg-light dark:bg-dark overflow-hidden z-[9999] fixed  h-[87.5%] pr-1 w-[85%] overflow-y-auto  overflow-x-hidden bottom-0 right-0  cursor-default ">
                <div className="w-[25%] mx-auto py-8 flex flex-col gap-5  ">
                    <button onClick={() => setNotify2(!openNotify)} className=" absolute right-full w-[4rem] top-0 translate-x-[175%] translate-y-[25%] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2">
                        {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                        <span className="text-4xl">&#171;</span> Back
                    </button>
                    <div className="text-2xl font-semibold py-6 text-center">
                        Remox Pay
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="text-greylish dark:text-white">Choose Wallet</div>
                        <div className=" gap-5 w-full">
                            <Dropdown parentClass={'!rounded-lg'} className="w-full  bg-white dark:bg-darkSecond !rounded-lg h-[3.4rem] truncate" photoDisplay={true} childClass=" flex gap-2" list={list} selected={selectedItem} onSelect={(w) => {
                                setItem(w)
                            }} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="text-greylish dark:text-white">Choose Budget</div>
                        <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                            setSelectedPayment(e)
                        }} />
                    </div>
                    {selectedPayment && <div className="flex flex-col gap-2 w-full">
                        <div className="text-greylish dark:text-white">Choose Subbudget</div>
                        <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} list={paymentname2} selected={selectedPayment2} onSelect={(e) => {
                            setSelectedPayment2(e)
                        }} />
                    </div>}
                    <div className="grid grid-cols-2 w-full pt-4 gap-4 ">
                <Button version="second" className={'!py-2 px-9 w-full rounded-xl'} onClick={() => {  setNotify2(false)  }}>Close</Button>
                {/* <ForwardButton setNotify={setNotify} openNotify={openNotify} setModals={setModals} onDisable={onDisable} ref={exceptRef} /> */}
                <div className="w-full">
                    <Button type="submit" className={'!py-2 px-10 w-full rounded-xl'} onClick={() => {setNotify(true);setNotify2(false)  }}>Next</Button>
                </div>
            </div>
                </div>
            </motion.div>}
        </AnimatePresence>
    </>
}

export default Walletmodal