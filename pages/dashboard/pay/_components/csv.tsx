import { IAccountORM } from "pages/api/account/index.api"
import { useAppSelector } from "redux/hooks"
import { SelectFiatPreference, SelectFiatSymbol, SelectHistoricalPrices, SelectPriceCalculation } from "redux/slices/account/selector"
import { AddressReducer } from "utils"
import { generatePriceCalculation } from "utils/const"
import { IPaymentInputs } from "../[[...name]].page"

interface IProps {
    data: IPaymentInputs[],
    account: IAccountORM | null
}
const CsvModal = ({ data, account }: IProps) => {
    const preference = useAppSelector(SelectFiatPreference)
    const hp = useAppSelector(SelectHistoricalPrices)
    const pc = useAppSelector(SelectPriceCalculation)
    const symbol = useAppSelector(SelectFiatSymbol)


    return <div className="px-10">
        <h1 className="font-semibold text-2xl mb-7">Uploaded CSV</h1>
        <div>
            <table className="w-full" style={{
                emptyCells: "hide"
            }}>
                <tr className="pl-5 grid grid-cols-[20%,30%,50%] text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-100 dark:bg-darkSecond rounded-md">
                    <th className="py-2 self-center text-left">Name</th>
                    <th className="py-2 self-center text-left">Wallet Address</th>
                    <th className="py-2 self-center text-left">Amount</th>
                </tr>
                {data.map(s => {

                    return <tr className="bg-white dark:bg-darkSecond py-[1.6875rem] pl-5 grid grid-cols-[20%,30%,50%] mt-5 rounded-md shadow-custom">
                        <td className="font-semibold text-sm text-greylish">
                            {s.name}
                        </td>
                        <td className="font-semibold text-sm text-greylish">
                            {AddressReducer(s.address ?? "")}
                        </td>
                        <td className="flex space-x-1 items-center font-medium">
                            <img src={s.coin?.logoURI} alt="" className="rounded-full object-cover w-5 aspect-square" />
                            <div> {s.amount}</div>
                        </td>
                    </tr>
                })}
            </table>
        </div>
        {account &&
            <div className="bg-white dark:bg-darkSecond flex flex-col">
                <div>Review Treasury Impact</div>
                <div className="flex">
                    <div className="w-[30%]">
                        {symbol}{account.coins.reduce((a, c) => {
                            return a + generatePriceCalculation(c, hp, pc, preference);
                        }, 0)}
                    </div>
                    <div>

                    </div>
                </div>
            </div>
        }
    </div>
}

export default CsvModal