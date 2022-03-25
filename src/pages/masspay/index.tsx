import { useState, useEffect, SyntheticEvent } from "react";
import Dropdown from "components/general/dropdown";
import { useNavigate, useLocation } from 'react-router-dom'
import ClipLoader from "react-spinners/ClipLoader";
import Success from "components/general/success";
import Error from "components/general/error";
import { DropDownItem } from "types/dropdown";
import { MultipleTransactionData } from "types/sdk";
import { selectStorage } from "redux/reducers/storage";
import TeamInput from "subpages/pay/teaminput";
import { Coins } from "types/coins";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectBalances } from "redux/reducers/currencies";
import { changeError, selectDarkMode, selectError } from "redux/reducers/notificationSlice";
import { SelectSelectedAccount } from "redux/reducers/selectedAccount";
import { useRefetchData } from "hooks";
import Button from "components/button";
import { DateInterval, IMember } from "API/useContributors";
import usePay, { PaymentInput } from "API/usePay";
import useMultisig from "API/useMultisig";
import { selectContributors } from "redux/reducers/contributors";
import useContributors from "hooks/useContributors";
import date from 'date-and-time'
import { encryptMessage } from "utils/hashing";
import { IRequest } from "API/useRequest";
import { Tag } from "API/useTags";
import { selectTags } from "redux/reducers/tags";


const MassPay = () => {
    const { state } = useLocation() as { state: { memberList?: IMember[] | IRequest[], request?: boolean } }
    const memberList = state?.memberList
    const { editMember } = useContributors()


    const storage = useAppSelector(selectStorage)
    const selectedAccount = useAppSelector(SelectSelectedAccount)
    const isError = useAppSelector(selectError)
    const balance = useAppSelector(SelectBalances)
    const tags = useAppSelector(selectTags)
    const dark = useAppSelector(selectDarkMode)

    const router = useNavigate();
    const dispatch = useAppDispatch()

    const [refetch] = useRefetchData()

    const { BatchPay, Pay } = usePay()
    const { submitTransaction } = useMultisig()

    const contributors = useAppSelector(selectContributors).contributors

    const [isPaying, setIsPaying] = useState(false)
    const [isSuccess, setSuccess] = useState(false)


    const [selectedTeam, setSelectedTeam] = useState<DropDownItem | undefined>(memberList ? { name: "Custom", address: "0" } : undefined);

    const [resMember, setResMember] = useState<Array<(IMember | IRequest) & { selected: boolean }>>(memberList ? memberList.map(w => ({ ...w, selected: false })) : [])
    const [members, setMembers] = useState<IMember[] | IRequest[] | undefined>(memberList);
    const [selectedId, setSelectedId] = useState<string[]>(memberList ? memberList.map(w => w.id) : []);

    useEffect(() => {
        if (contributors && contributors.length && !memberList) {
            setSelectedTeam({ name: contributors[0].name, address: contributors[0].id })
        }
    }, [contributors])

    useEffect(() => {
        if (contributors && contributors.length && selectedTeam && selectedTeam.address && selectedTeam.name.toLowerCase() !== "custom") {
            const team = contributors.find(w => w.id === selectedTeam.address)
            if (team && team.members) {
                setResMember(team.members.map(w => ({ ...w, selected: false })))
            }
            setMembers(contributors.find(w => w.id === selectedTeam.address)!.members)
        }
    }, [selectedTeam, contributors])

    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        const result: Array<MultipleTransactionData & { member?: IMember | IRequest }> = []

        const mems = resMember.filter(w => selectedId.includes(w.id))

        if (mems.length) {
            for (let index = 0; index < mems.length; index++) {
                let amount;
                if (mems[index].usdBase) {
                    amount = (parseFloat(mems[index].amount) * (balance[Coins[mems[index].currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toString()
                } else {
                    amount = mems[index].amount
                }
                result.push({
                    toAddress: mems[index].address,
                    amount,
                    tokenName: mems[index].currency,
                    member: mems[index]
                })

                let secAmount = mems[index].secondaryAmount, secCurrency = mems[index].secondaryCurrency;

                if (secAmount && secCurrency) {
                    if (mems[index].secondaryAmount) {
                        secAmount = (parseFloat(secAmount) * (balance[Coins[mems[index].secondaryCurrency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toFixed(4)
                    }

                    result.push({
                        toAddress: mems[index].address,
                        amount: secAmount,
                        tokenName: secCurrency,
                    })
                }
            }
        }
        setIsPaying(true)

        try {
            if (storage!.accountAddress.toLowerCase() === selectedAccount.toLowerCase()) {
                if (result.length === 1) {
                    await Pay({ coin: Coins[result[0].tokenName as keyof Coins], recipient: result[0].toAddress, amount: result[0].amount }, { interval: "instant" }, [tags.find(w => w.id === "Payroll")!])

                    if (result[0].member && !state?.request) {
                        let member = { ...result[0].member! } as IMember;
                        const isMonthly = member.interval === DateInterval.monthly;
                        const isOverdue = new Date(member.paymantDate).getTime() < new Date().getTime();
                        member.paymantDate = isMonthly ? date.addMonths(isOverdue ? new Date() : new Date(member.paymantDate), 1).toISOString() : date.addDays(isOverdue ? new Date() : new Date(member.paymantDate), 7).toISOString();
                        member.name = encryptMessage(`${member.name}`, storage?.encryptedMessageToken)
                        member.address = encryptMessage(member.address, storage?.encryptedMessageToken)
                        member.amount = encryptMessage(member.amount, storage?.encryptedMessageToken)
                        if (member.secondaryAmount) {
                            member.secondaryAmount = encryptMessage(member.secondaryAmount, storage?.encryptedMessageToken)
                        }
                        await editMember(member.teamId, member.id, member)
                    }
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: Coins[w.tokenName as keyof Coins],
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    await BatchPay(arr, undefined, [tags.find(w => w.id === "Payroll")!])

                    for (let index = 0; index < result.length; index++) {
                        if (result[index].member && !state?.request) {
                            let member = { ...result[index].member! } as IMember;
                            const isMonthly = member.interval === DateInterval.monthly;
                            const isOverdue = new Date(member.paymantDate).getTime() < new Date().getTime();
                            member.paymantDate = isMonthly ? date.addMonths(isOverdue ? new Date() : new Date(member.paymantDate), 1).toISOString() : date.addDays(isOverdue ? new Date() : new Date(member.paymantDate), 7).toISOString();
                            member.name = encryptMessage(`${member.name}`, storage?.encryptedMessageToken)
                            member.address = encryptMessage(member.address, storage?.encryptedMessageToken)
                            member.amount = encryptMessage(member.amount, storage?.encryptedMessageToken)
                            if (member.secondaryAmount) {
                                member.secondaryAmount = encryptMessage(member.secondaryAmount, storage?.encryptedMessageToken)
                            }

                            await editMember(member.teamId, member.id, member)
                        }
                    }
                }
            } else {
                if (result.length === 1) {
                    await submitTransaction(selectedAccount, [{ recipient: result[0].toAddress, amount: result[0].amount, coin: Coins[result[0].tokenName as keyof Coins] }])
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: Coins[w.tokenName as keyof Coins],
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    await submitTransaction(selectedAccount, arr)
                }
            }
            setSuccess(true);
            refetch()

        } catch (error: any) {
            console.error(error)
            dispatch(changeError({ activate: true, text: error.message }));
        }

        setIsPaying(false);
    }


    return <div>
        <form onSubmit={Submit}>
            <div className="flex flex-col items-center justify-start min-h-screen">
                <div className="w-[95%] sm:w-[85vw] min-h-[75vh] py-10">
                    <div className="w-full">
                        <div className="text-xl text-center font-semibold py-5">Mass Payout</div>
                    </div>
                    <div className=" h-auto rounded-xl flex flex-col gap-10 py-10">
                        {contributors && contributors.length === 0 ? <div className="flex justify-center">No Team Yet. Please, first, create a team</div> : <><div className="flex flex-col px-4 sm:pl-12 sm:pr-[20%] gap-10">

                            <div className="flex flex-col space-y-3">
                                <span className="text-left text-sm font-semibold">Paying From</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 sm:gap-x-10">
                                    {!(contributors && selectedTeam) ? <ClipLoader /> : <Dropdown className="h-full" disableAddressDisplay={true} onSelect={setSelectedTeam} nameActivation={true} selected={selectedTeam} list={contributors.map(w => ({ name: w.name, address: w.id }))} />}
                                    {/* {!(balance && balance.CELO && selectedWallet) ? <ClipLoader /> : <Dropdown onSelect={setSelectedWallet} nameActivation={true} selected={selectedWallet} list={list} disableAddressDisplay={true} />} */}
                                </div>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <span className="text-left text-sm font-semibold">Tags</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 sm:gap-x-10">
                                    {tags.length > 0 && <div className="flex space-x-3 border rounded-lg items-center px-2 py-3 dark:border-darkSecond">
                                        <div className="w-[1.125rem] h-[1.125rem] rounded-full" style={{ backgroundColor: tags.find(s => s.name == "Payroll")?.color }}></div>
                                        <div>Payroll</div>
                                    </div>}
                                    {tags.length === 0 && <div>No tag yet</div>}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex justify-between py-4 items-center">
                                    <span className="text-left font-semibold">Team Details</span>
                                    <div className="flex space-x-2 items-center">
                                        <input type="checkbox" className="relative cursor-pointer w-[1.25rem] h-[1.25rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                                            if (e.target.checked) setSelectedId(resMember.map(w => w.id))
                                            else setSelectedId([])
                                        }} />
                                        <div>
                                            Select All
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-[20%,42%,33%,5%] gap-5">
                                    <div className="hidden sm:block font-semibold">Name</div>
                                    <div className="hidden sm:block font-semibold">Address</div>
                                    <div className="hidden sm:block font-semibold">Disbursement</div>
                                    <div className="hidden sm:block"></div>
                                    {contributors && resMember && members && members.length > 0 ? resMember.map((w, i) => <TeamInput selectedId={selectedId} setSelectedId={setSelectedId} key={w.id} index={i} {...w} members={resMember} setMembers={setResMember} />) : 'No Member Yet'}
                                </div>
                            </div>
                            <span className="text-lg">Total: $ {Object.values(resMember.filter(s => selectedId.includes(s.id))).reduce((a, e, i) => {
                                if (e.secondaryCurrency && e.secondaryAmount) {
                                    if (e.usdBase) {
                                        a += parseFloat(e.secondaryAmount)
                                    } else {
                                        a += parseFloat(e.secondaryAmount) * (balance[Coins[e.secondaryCurrency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)
                                    }
                                }
                                if (e.usdBase) return a + parseFloat(e.amount);
                                return a + parseFloat(e.amount) * (balance[Coins[e.currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1);
                            }, 0).toFixed(2)}</span>
                            <div className="flex flex-col space-y-3">
                                <span className="text-left">Description (Optional)</span>
                                <div className="grid grid-cols-1">
                                    <textarea className="border-2 rounded-xl p-1 outline-none dark:bg-darkSecond dark:border-darkSecond" name="description" id="" cols={30} rows={5}></textarea>
                                </div>
                            </div>
                        </div>
                            <div className="flex justify-center">
                                <div className="flex flex-col-reverse sm:grid sm:grid-cols-2 w-[25rem] justify-center gap-5">
                                    <Button version="second" onClick={() => router("/dashboard")}>Close</Button>
                                    <Button type="submit" isLoading={isPaying}>Pay</Button>
                                </div>
                            </div> </>}
                    </div>
                </div>
            </div>
        </form>
        {isSuccess && <Success onClose={setSuccess} onAction={() => { router("/dashboard") }} />}
        {isError && <Error onClose={(val) => dispatch(changeError({ activate: false, text: '' }))} />}
    </div>

}

export default MassPay;