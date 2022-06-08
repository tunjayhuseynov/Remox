import useLending, { LendingUserComponentData } from "rpcHooks/useLending";
import Loader from "components/Loader";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMoolaData, updateData } from "redux/reducers/moola";
import Card from "subpages/dashboard/lend&borrow/card";


const DynamicLendBorrow = ({ type }: { type: "lend" | "borrow" }) => {
    const userData = useSelector(selectMoolaData)

    const {
        InitializeUser,
        initLoading
    } = useLending()


    useEffect(() => {
        (async () => {
            await InitializeUser()
        })()
    }, [])

    let data = userData.filter(s => type === "lend" ? s.lendingBalance !== 0 : s.loanBalance !== 0)
    let defaultValue = userData.find(s => s.currency.name === "cUSD")
    return <div className={` ${data.length > 1 ? "grid grid-cols-2 gap-10" : ""} `}>
        {data.map((box) => <Card key={box.currency.contractAddress} box={box} type={type} />)}
        {
            data.length === 0 && defaultValue && <Card key={defaultValue.currency.contractAddress} box={defaultValue} type={type} />
        }
        {initLoading && <div className="flex items-center justify-center"><Loader /></div>}
    </div>

}


export default DynamicLendBorrow