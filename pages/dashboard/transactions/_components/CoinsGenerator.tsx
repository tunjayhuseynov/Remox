import { ITransfer } from "hooks/useTransactionProcess"
import { useAppSelector } from "redux/hooks"
import { SelectFiatPreference, SelectHistoricalPrices } from "redux/slices/account/selector"
import { DecimalConverter } from "utils/api"
import { GetFiatPrice } from "utils/const"

interface IProps { transfer: Pick<ITransfer, "coin" | "amount">, timestamp: number }
export const CoinDesignGenerator = ({ transfer, timestamp }: IProps) => {
    const fiatPreference = useAppSelector(SelectFiatPreference)
    const hp = useAppSelector(SelectHistoricalPrices)

    const fiatPrice = GetFiatPrice(transfer.coin, fiatPreference)

    const date = new Date(timestamp)
    const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    const hpCoinPrice = hp[transfer.coin.symbol]?.[fiatPreference].find(h => h.date === dateString)?.price ?? fiatPrice

    return <div className="flex space-x-3">
        <div className="w-[1.5rem] h-[1.5rem]">
            {transfer?.coin?.logoURI ? <img
                src={transfer.coin.logoURI}
                width="100%"
                height="100%"
                className="rounded-full"
            /> : <div className="w-full h-full rounded-full bg-gray-500" />}
        </div>
        <div className="flex flex-col text-left">
            <span className="font-semibold text-left">
                {DecimalConverter(transfer.amount, transfer.coin.decimals).toFixed(0).length > 18 ? 0 : DecimalConverter(transfer.amount, transfer.coin.decimals).toLocaleString()}
            </span>
            <span className="text-xs text-gray-200">
                {`$${(DecimalConverter(transfer.amount, transfer.coin.decimals) * hpCoinPrice).toFixed(0).length > 18 ? 0 : (DecimalConverter(transfer.amount, transfer.coin.decimals) * hpCoinPrice).toLocaleString()}`}
            </span>
        </div>
    </div>
}