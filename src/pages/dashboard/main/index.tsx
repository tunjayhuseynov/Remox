import { ClipLoader } from 'react-spinners';
import TransactionHistory from '../../../subpages/dashboard/main/transactionHistory'
import Statistics from '../../../subpages/dashboard/main/statistics'
import useTransactionProcess from '../../../hooks/useTransactionProcess';
import { useEffect, useRef, useState } from 'react';
import { useContractKit } from '@celo-tools/use-contractkit';
import GELATO from 'API/ABI/Gelato.json'
import { AbiItem } from 'web3-utils';

const Main = () => {
    const [transactions] = useTransactionProcess(true)

    return <main className="flex gap-5 flex-col xl:flex-row">
        <div className="w-1/2">
            <div className="grid grid-cols-2 gap-8 max-h-full">
                <Statistics />
            </div>
        </div>
        <div className=" w-1/2">
            <div id="transaction" className=" pt-[30px]">
                {transactions ? <TransactionHistory transactions={transactions} /> : <div className="flex justify-center"> <ClipLoader /></div>}
            </div>
        </div>
    </main>
}

export default Main;