import { useState } from 'react';
import { LendingUserComponentData } from 'rpcHooks/useLending';
import Button from 'components/button';
import Modal from 'components/general/Modal';
import MdContent from './mdcontent';

export default function Card({ box, type }: { box: LendingUserComponentData, type: "lend" | "borrow" }) {
    const [leftModal, setLeftModal] = useState(false)
    const [rightModal, setRightModal] = useState(false)

    const isLending = type === "lend"
    return (
        <div className={`rounded-xl shadow-custom px-10 pb-10 pt-10 bg-white dark:bg-darkSecond`}>
            <div className='flex flex-col space-y-3'>
                <div className='flex flex-col gap-20'>
                    <div className="grid grid-cols-2 text-center">
                        <div className="flex flex-col items-center justify-center text-center pb-2">
                            <div className="text-xl">{isLending ? "Current Lending Balance" : "Current Loan Amount"}</div>
                            <div> <span>{isLending ? box.lendingBalance : box.loanBalance}</span> <span className="opacity-80">{box.currency.name}</span> </div>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center pb-2">
                            <div className="text-xl">{isLending ? "Lendin APY" : "Interest Rate"}</div>
                            <div>{isLending ? <><span>Up to </span>{box.apy}</> : box.averageStableBorrowRate}<span className="opacity-80"> %</span> </div>
                        </div>
                    </div>
                    <div className={`flex items-center justify-center ${box.walletBalance !== 0 ? "gap-10" : ""} `}>
                        {((box.lendingBalance !== 0 && isLending) || (box.loanBalance !== 0 && !isLending)) ? <Button onClick={() => { setLeftModal(true) }} version="second" className=" bg-primary !px-3 !py-2 text-white flex items-center justify-center rounded-lg" >{isLending ? "Withdraw Funds" : "Repay Funds"}</Button> : undefined}
                        <Button onClick={() => { setRightModal(true) }} className=" bg-primary !px-3 !py-2 text-white flex items-center justify-center rounded-lg" >{isLending ? "Deposits Funds" : "Borrow Funds"}</Button>
                    </div>
                    <div className="flex items-center justify-center">
                        <p>{isLending ? `Deposit ${box.currency.name} to begin earing fees` : "Take out a crypto backet loan against your lending balance"}</p>
                    </div>
                </div>
            </div>
            {leftModal && ((box.lendingBalance !== 0 && isLending) || (box.loanBalance !== 0 && !isLending)) &&
                <Modal onDisable={setLeftModal} animatedModal={false} className="lg:min-w-[30%]" disableX={true}>
                    <MdContent box={box} type={isLending ? "withdraw" : "repay"} setModal={setLeftModal} />
                </Modal>
            }
            {rightModal &&
                <Modal onDisable={setRightModal} animatedModal={false} className="lg:min-w-[30%]" disableX={true}>
                    <MdContent box={box} type={isLending ? "deposit" : "borrow"} setModal={setRightModal} />
                </Modal>
            }
        </div>
    )
}
