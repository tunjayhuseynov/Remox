import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import useMultisigProcess from 'hooks/useMultisigProcess'
import { SelectSelectedAccount } from "redux/reducers/selectedAccount"
import { ClipLoader } from "react-spinners"
import { selectStorage } from "redux/reducers/storage"
import { useEffect, useState } from "react"
import { AltCoins } from "types"
import { changeError, selectError } from "redux/reducers/notificationSlice"
import Error from "components/general/error"
import Button from "components/button"
import { selectMultisigTransactions } from "redux/reducers/multisig"
import { useWalletKit } from "hooks"

const MultisigTransaction = () => {
    const history = useNavigate()
    const { id } = useParams<{ id: string }>()
    const selectedAddress = useSelector(SelectSelectedAccount)
    const storage = useSelector(selectStorage)
    const selectMultisig = useSelector(selectMultisigTransactions)
    const { signAndInternal: signData, owners, refetch: refreshMultisig, confirmTransaction, revokeTransaction, isLoading } = useMultisigProcess()
    const transactionData = selectMultisig?.find(t => t.id === parseInt(id!))
    const { GetCoins } = useWalletKit()

    const isError = useSelector(selectError)
    const dispatch = useDispatch()

    const [filterData, setFilterData] = useState<{
        requiredCount?: string,
        owner?: string,
        newOwner?: string,
        valueOfTransfer?: string,
        method?: string
    }>({})

    useEffect(() => {
        if (transactionData) {
            setFilterData({
                requiredCount: transactionData.requiredCount,
                owner: transactionData.owner,
                newOwner: transactionData.newOwner,
                valueOfTransfer: transactionData.valueOfTransfer,
                method: transactionData.method
            })
        }
    }, [transactionData])

    const submitAction = async () => {
        if (!transactionData?.confirmations.includes(storage!.accountAddress)) {
            try {
                await confirmTransaction(selectedAddress, parseInt(id!))
                if ((transactionData?.confirmations?.length ?? 0) - 1 === signData?.sign) {
                    history('/dashboard/transactions')
                }
                refreshMultisig()
            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: error?.data?.message }));
            }

        } else {
            try {
                await revokeTransaction(selectedAddress, parseInt(id!))
                refreshMultisig()
            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: error?.data?.message }));
            }
        }
    }


    if (!transactionData) {
        return <div className="w-full h-screen flex items-center justify-center"> <div><ClipLoader /></div></div>
    }

    return <div className="flex w-[60%] my-14 mx-auto">
        <div className="flex flex-col w-full space-y-10 flex-wrap">
            <div className="flex flex-col space-y-3">
                <div className="font-bold text-lg">
                    Transaction Status
                </div>
                <div>
                    Transaction requires the confirmation of <span className="font-semibold">{transactionData?.method?.toLowerCase().includes("transfer") ? signData?.sign : signData?.internalSigns} out of {owners?.length} owners</span>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-y-5">
                {owners?.map((w, i, arr) =>
                    <div key={w} className="flex flex-col   gap-4 items-center justify-center w-[7.5rem]" title={w}>
                        <div className={`w-[2.188rem] shadow-custom h-[2.188rem] relative ${w.toLowerCase() === storage!.accountAddress.toLowerCase() ? "bg-[#3EBE11]" : ""} ${i !== 0 ? "before:-translate-x-full before:absolute before:top-1/2 before:w-full before:h-[0.125rem] before:bg-black" : ""} ${i !== arr.length - 1 ? "after:translate-x-[70%] after:absolute after:top-1/2 after:w-[150%] after:h-[0.125rem] after:bg-black " : ""} rounded-full ${transactionData?.confirmations.includes(w) ? "bg-[#0055FF]" : "bg-[#E90D0D]"}`}></div>
                        <div className="truncate max-w-[7.5rem] font-semibold">
                            {w.toLowerCase() !== storage!.accountAddress.toLowerCase() ? w.split('').reduce((a, c, i, arr) => {
                                return i < 6 || (arr.length - i) < 3 ? a + c : a.split('.').length - 1 < 6 ? a + '.' : a
                            }, '') : "You"}
                        </div>
                        <div className="h-[1.563rem]">
                            {w.toLowerCase() !== storage!.accountAddress.toLowerCase() ? transactionData?.confirmations.includes(w) ? "Approved" : "Pending" : ""}
                        </div>
                    </div>
                )}
            </div>
            <div className="shadow-custom w-full px-10 py-5">
                <div className="text-xl font-semibold pb-5">Transaction Detail</div>
                <div className="grid" style={{
                    gridTemplateColumns: `repeat(${Object.values(filterData).filter(s => s).length}, minmax(0, 1fr))`
                }}>
                    {filterData.method ? <div className="py-3 border-b border-black">Action Name</div> : null}
                    {filterData.valueOfTransfer ? <div className="py-3 border-b border-black">Amount</div> : null}
                    {filterData.owner ? <div className="py-3 border-b border-black">{filterData.newOwner ? "Old" : "Address"}</div> : null}
                    {filterData.newOwner ? <div className=" py-3 border-b border-black">New</div> : null}
                    {filterData.requiredCount ? <div className=" py-3 border-b border-black">New Signature Threshold</div> : null}
                    {filterData.method ? <div className=" pt-3">{
                        filterData.method!.split('').reduce((acc, w, i) => {
                            if (i === 0) return acc + w.toUpperCase()
                            if (w !== w.toLowerCase() && i > 0) return acc + " " + w
                            return acc + w;
                        }, '')
                    }</div> : null}
                    {filterData.valueOfTransfer && GetCoins ? <div className="flex space-x-3 items-center pt-3">
                        <div>
                            <img src={(Object.values(GetCoins).find((s: AltCoins) => s.contractAddress.toLowerCase() === transactionData?.destination.toLowerCase()) as AltCoins).coinUrl} alt="" className='w-[1.563rem] h-[1.563rem]' />
                        </div>
                        <div>{filterData.valueOfTransfer}</div>
                    </div> : null}
                    {filterData.owner ? <div className=" pt-3 text-sm truncate" title={filterData.owner}>{filterData.owner}</div> : null}
                    {filterData.newOwner ? <div className=" pt-3 text-sm truncate" title={filterData.newOwner}>{filterData.newOwner}</div> : null}
                    {filterData.requiredCount ? <div className=" pt-3 text-sm" title={filterData.requiredCount}>{+filterData.requiredCount}</div> : null}
                </div>
            </div>
            <div className="flex justify-center space-x-5">
                <div>
                    <Button version="second" className="px-5 !py-2 w-[7.813rem]" onClick={() => history(-1)}>
                        Back
                    </Button>
                </div>
                {transactionData?.executed ? <div className='px-5 text-primary font-semibold'>Already Executed</div> : <div>
                    <Button onClick={submitAction} isLoading={isLoading} className={`${!transactionData?.confirmations.includes(storage!.accountAddress) ? "bg-[#2D5EFF] border-[#2D5EFF] hover:border-primary" : "bg-[#EF2727] border-[#EF2727]"} border-2 text-white px-5 !py-2 rounded-xl w-[7.813rem]`}>
                        {!transactionData?.confirmations.includes(storage!.accountAddress) ? "Approve" : "Revoke"}
                    </Button>
                </div>}
            </div>
        </div>
        {isError && <Error onClose={(val) => dispatch(changeError({ activate: val, text: '' }))} />}
    </div>
}

export default MultisigTransaction