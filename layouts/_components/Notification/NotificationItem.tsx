import { ERCMethodIds, GenerateTransaction, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "hooks/useTransactionProcess"
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig"
import { BlockchainType } from "types/blockchains"
import { TransactionDirectionDeclare, TransactionDirectionImageNameDeclaration } from "utils"
import dateFormat from "dateformat";
import { useRouter } from "next/dist/client/router";
import _ from "lodash";
import { Dispatch, forwardRef } from 'react'
import { AltCoins } from "types";
import { DecimalConverter } from "utils/api";
import BigNumber from "bignumber.js";

interface IProps {
    item: IFormattedTransaction | ITransactionMultisig,
    index: number,
    addresses: string[],
    blockchain: BlockchainType,
    lastSeenTime: number,
    setNotify: Dispatch<boolean>
}

const NotificationItem = forwardRef<HTMLDivElement, IProps>(({ setNotify, item, index, addresses, blockchain, lastSeenTime }, ref) => {
    const navigate = useRouter()

    const hash = 'tx' in item ? `${item.contractAddress}${item.hashOrIndex}${index}` : `${item.hash}${index}`
    const method = 'tx' in item ? item.tx.method : item.method
    const rawData = 'tx' in item ? null : item.rawData
    const address = 'tx' in item ? item.contractAddress : item.address
    const isError = 'tx' in item ? item.tx.isError : item.isError

    let amount: string | undefined;
    let coin: AltCoins | undefined;

    let amountFrom: string | undefined;
    let coinFrom: AltCoins | undefined;

    let amountTo: string | undefined;
    let coinTo: AltCoins | undefined;

    if (method === ERCMethodIds.swap) {
        const data = 'tx' in item ? item.tx as ISwap : item as ISwap;

        amountFrom = data.amountIn;
        coinFrom = data.coinIn;

        amountTo = data.amountOutMin;
        coinTo = data.coinOutMin;
    }

    if (
        method === ERCMethodIds.transfer ||
        method === ERCMethodIds.transferFrom ||
        method === ERCMethodIds.transferWithComment ||
        method === ERCMethodIds.automatedTransfer ||
        method === ERCMethodIds.borrow ||
        method === ERCMethodIds.repay ||
        method === ERCMethodIds.withdraw ||
        method === ERCMethodIds.deposit
    ) {

        amount = 'tx' in item ? item.tx.amount : (item as ITransfer).amount
        coin = 'tx' in item ? item.tx.coin : (item as ITransfer).coin
    }
   
    let direction = TransactionDirectionDeclare(item, addresses);
    const [image, name, action] = TransactionDirectionImageNameDeclaration(blockchain, direction, 'tx' in item, 'tx' in item ? item.provider : undefined);

    const goToTx = () => {
        let isExecuted = 'tx' in item ? (item.isExecuted || item.rejection?.isExecuted) : true
        navigate.push(`/dashboard/transactions${isExecuted ? "/history" : ""}?index=${index}`)
        setNotify(false)
    }

    let batchAllocation: [IBatchRequest["payments"][0]["coin"], IBatchRequest["payments"][0]["amount"]][] = [];
    if (method === ERCMethodIds.batchRequest) {
        for (const pay of (('tx' in item ? item.tx : item) as IBatchRequest).payments) {
            if (batchAllocation.find(s => s[0].symbol === pay.coin.symbol)) {
                batchAllocation.find(s => s[0].symbol === pay.coin.symbol)![1] = new BigNumber(batchAllocation.find(s => s[0].symbol === pay.coin.symbol)![1]).plus(pay.amount).toString()
            }else{
                batchAllocation.push([pay.coin, pay.amount])
            }
        }
    }

    return <div ref={ref} key={hash} onClick={goToTx} className="py-2 grid grid-cols-[5%,1fr,60%,25%] items-center hover:bg-light dark:hover:bg-dark rounded-md cursor-pointer">
        {item.timestamp > lastSeenTime ? <div className="rounded-full w-[10px] h-[10px] bg-primary ml-2"></div> : <span></span>}
        <img src={image} alt="" className="w-8 h-8 rounded-full object-cover" />
        <div className="flex flex-col items-start">
            <div className="text-sm font-medium">
                {action} {amount && coin && method !== ERCMethodIds.swap && method !== ERCMethodIds.batchRequest ? (DecimalConverter(amount, coin.decimals).toFixed(0).length <= 18 ? DecimalConverter(amount, coin.decimals) : 0.0001).toLocaleString() : ''} {amount && coin && ERCMethodIds.swap !== method ? coin.symbol : ''}
                {method === ERCMethodIds.batchRequest ? `${(Array.from(new Set((('tx' in item ? item.tx : item) as IBatchRequest)?.payments.map(s=>s.to)))).length} batch requests` : ''}
                {method === ERCMethodIds.swap && (<>from {DecimalConverter(amountFrom ?? 0, coinFrom?.decimals ?? 18).toFixed(2)} {coinFrom?.symbol} to {DecimalConverter(amountTo ?? 0, coinTo?.decimals ?? 18).toFixed(2)} {coinTo?.symbol}</>)}
            </div>
            <div className="font-medium text-[10px] text-primary cursor-pointer" onClick={() => navigate.push('/dashboard/transactions')}>View Transaction</div>
        </div>
        <div className="text-greylish font-light text-[10px] flex justify-end items-center gap-2 pr-3">{dateFormat(new Date(item.timestamp * 1e3), "mmm dd")} at {dateFormat(new Date(item.timestamp * 1e3), "hh:mm")}<span className="text-greylish text-2xl pb-1">&#8250;</span> </div>
    </div>
})

export default NotificationItem