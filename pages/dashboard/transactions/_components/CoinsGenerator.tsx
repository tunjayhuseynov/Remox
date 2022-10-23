import { ITransfer } from "hooks/useTransactionProcess"
import { useAppSelector } from "redux/hooks"
import { SelectFiatPreference, SelectFiatSymbol, SelectHistoricalPrices, SelectPriceCalculationFn } from "redux/slices/account/selector"
import { DecimalConverter } from "utils/api"
import { NG } from "utils/jsxstyle"


interface IProps { transfer: Pick<ITransfer, "coin" | "amount">, timestamp: number, amountImageThenName?: boolean }
export const CoinDesignGenerator = ({ transfer, timestamp, amountImageThenName }: IProps) => {
    const fiatPreference = useAppSelector(SelectFiatPreference)
    const hp = useAppSelector(SelectHistoricalPrices)
    const calculatePrice = useAppSelector(SelectPriceCalculationFn)
    const symbol = useAppSelector(SelectFiatSymbol)

    const fiatPrice = calculatePrice({ ...transfer.coin, amount: DecimalConverter(transfer.amount, transfer.coin.decimals), coin: transfer.coin })

    const date = new Date(timestamp)
    const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    const hpCoinPrice = hp[transfer.coin.symbol]?.[fiatPreference].find(h => h.date === dateString)?.price

    const price = hpCoinPrice ? DecimalConverter(transfer.amount, transfer.coin.decimals) * hpCoinPrice : fiatPrice

    return <>
        {amountImageThenName ? <div className="flex space-x-2">
            <span className="text-sm text-left">
                {DecimalConverter(transfer.amount, transfer.coin.decimals).toFixed(0).length > 18 ? 0 : DecimalConverter(transfer.amount, transfer.coin.decimals).toLocaleString()}
            </span>
            <div className="w-[1.25rem] h-[1.25rem]">
                {transfer?.coin?.logoURI ? <img
                    src={transfer.coin.logoURI}
                    width="100%"
                    height="100%"
                    className="rounded-full"
                /> : <div className="w-full h-full rounded-full bg-gray-500" />}
            </div>
            <div className="text-sm">{transfer.coin.symbol}</div>
        </div> :
            <div className="flex flex-col">
                <div className="grid grid-cols-[1.25rem,1fr] gap-x-[4px]">
                    <div className="w-[1.25rem] h-[1.25rem]">
                        {transfer?.coin?.logoURI ? <img
                            src={transfer.coin.logoURI}
                            width="100%"
                            height="100%"
                            className="rounded-full"
                        /> : <div className="w-full h-full rounded-full bg-gray-500" />}
                    </div>
                    <span className="font-medium text-sm text-left leading-none self-center gap-x-[7px]">
                        {DecimalConverter(transfer.amount, transfer.coin.decimals).toFixed(0).length > 18 ? 0 : DecimalConverter(transfer.amount, transfer.coin.decimals).toFixed(2)}
                    </span>
                </div>
                <div className="grid grid-cols-[1.25rem,1fr] gap-x-[4px]">
                    <div></div>
                    <span className="text-xxs font-medium text-gray-500 leading-none dark:text-gray-200">
                        {`${symbol}`}<NG fontSize={0.625} decimalSize={100} number={price.toFixed(0).length > 18 ? 0 : price} />
                    </span>
                </div>
            </div>
        }
    </>
}