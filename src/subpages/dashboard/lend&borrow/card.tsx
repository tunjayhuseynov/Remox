import { useContractKit } from '@celo-tools/use-contractkit';
import { MoolaUserComponentData } from 'API/useMoola';
import Button from 'components/button';
import Modal from 'components/general/modal';
import { useEffect, useState } from 'react';
import { AltCoins } from 'types';
import MdContent from './mdcontent';

export default function Card({ box, type }: { box: MoolaUserComponentData, type: "lend" | "borrow" }) {
    const [leftModal, setLeftModal] = useState(false)
    const [rightModal, setRightModal] = useState(false)

    const isLending = type === "lend"
    return (
        <div className={`rounded-xl shadow-custom px-10 pb-10 pt-10`}>
            <div className='flex flex-col space-y-3'>
                <div className='flex flex-col gap-20'>
                    <div className="grid grid-cols-2 text-center">
                        <div className="flex flex-col items-center justify-center text-center pb-2">
                            <div className="text-xl">{isLending ? "Current Lending Balance" : "Current Loan Amount"}</div>
                            <div> <span>{isLending ? box.lendingBalance.toPrecision(2) : box.loanBalance.toPrecision(2)}</span> <span className="opacity-80">{box.currency.name}</span> </div>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center pb-2">
                            <div className="text-xl">{isLending ? "Lendin APY" : "Interest Rate"}</div>
                            <div> <span>Up to </span>{isLending ? box.apy : box.averageStableBorrowRate}<span className="opacity-80"> %</span> </div>
                        </div>
                    </div>
                    <div className={`flex items-center justify-center ${box.walletBalance !== 0 ? "gap-10" : ""} `}>
                        {box.walletBalance !== 0 ? <Button onClick={() => { setLeftModal(true) }} version="second" className=" bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" >{isLending ? "Withdraw Funds" : "Repay Funds"}</Button> : undefined}
                        <Button onClick={() => { setRightModal(true) }} className=" bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" >{isLending ? "Deposits Funds" : "Borrow Funds"}</Button>
                    </div>
                    <div className="flex items-center justify-center">
                        <p>Deposit {box.currency.name} to begin earing fees</p>
                    </div>
                </div>
            </div>
            {leftModal && box.walletBalance !== 0 &&
                <Modal onDisable={setLeftModal} className="lg:min-w-[30%]">
                    <MdContent box={box} type={isLending ? "withdraw" : "repay"} setModal={setLeftModal} />
                </Modal>
            }
            {rightModal &&
                <Modal onDisable={setRightModal} className="lg:min-w-[30%]">
                    <MdContent box={box} type={isLending ? "deposit" : "borrow"} setModal={setRightModal} />
                </Modal>
            }
        </div>
    )
}
