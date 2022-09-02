import useLending, { LendingUserComponentData } from "rpcHooks/useLending";
import Loader from "components/Loader";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMoolaData, updateData } from "redux/slices/lending";
import Card from "./card";
import { useAppSelector } from "redux/hooks";
import { SelectSelectedAccountAndBudget } from "redux/slices/account/selector";


const DynamicLendBorrow = ({ type }: { type: "lend" | "borrow" }) => {
    const userData = useSelector(selectMoolaData)
    const SelectedAccountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)

    const {
        InitializeUser,
        initLoading
    } = useLending(SelectedAccountAndBudget.account!)


    useEffect(() => {
        (async () => {
            await InitializeUser()
        })()
    }, [])

    let data = userData.filter(s => type === "lend" ? s.lendingBalance !== 0 : s.loanBalance !== 0)
    let defaultValue = userData.find(s => s.currency.name === "cUSD")
    return <div className={` ${data.length > 1 ? "grid grid-cols-2 gap-10" : ""} `}>
        {data.map((box) => <Card key={box.currency.address} box={box} type={type} />)}
        {
            data.length === 0 && defaultValue && <Card key={defaultValue.currency.address} box={defaultValue} type={type} />
        }
        {initLoading && <div className="flex items-center justify-center"><Loader /></div>}
    </div>

}


export default DynamicLendBorrow