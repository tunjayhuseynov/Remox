import { Dispatch, SyntheticEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { changeError, changeSuccess } from "redux/reducers/notificationSlice";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "components/button";
import { DateInterval, ExecutionType, IMember } from "rpcHooks/useContributors";
import { useAppSelector } from "redux/hooks";
import { selectContributors } from "redux/reducers/contributors";
import useContributors from "hooks/useContributors";
import { selectStorage } from "redux/reducers/storage";
import useAllowance from "rpcHooks/useAllowance";
import useGelato from "rpcHooks/useGelato";
import { Contracts } from "rpcHooks/Contracts/Contracts";
import useCeloPay, { PaymentInput } from "rpcHooks/useCeloPay";
import date from 'date-and-time'
import { SelectBalances } from 'redux/reducers/currencies';
import { ToastRun } from "utils/toast";
import { CoinsName, CoinsURL } from "types";
import { useWalletKit } from "hooks";
import Loader from "components/Loader";
import Paydropdown from '../../../../subpages/pay/paydropdown';
import Upload from "components/upload";
import { useForm, SubmitHandler } from "react-hook-form";
import { IFormInput } from './addMember'

const EditMember = (props: IMember & { onCurrentModal: Dispatch<boolean>, onDisable: Dispatch<boolean> }) => {
    const { register, handleSubmit } = useForm<IFormInput>();
    const [userIsUpload, setUserIsUpload] = useState<boolean>(true)

    const paymentname: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])

    const paymentname2: DropDownItem[] = [{ name: "Full Time" }, { name: "Part Time" }, { name: "Bounty" }]
    const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0])

    const paymentname3: DropDownItem[] = [{ name: "Pay with Token Amounts" }, { name: "Pay with USD-based Amounts" }]
    const [selectedPayment3, setSelectedPayment3] = useState(paymentname3[0])

    const paymentname4: DropDownItem[] = [{ name: "Manual" }, { name: "Auto" }]
    const [selectedPayment4, setSelectedPayment4] = useState(paymentname4[0])

    const dispatch = useDispatch()
    const [file, setFile] = useState<File>()
    const { GetCoins, blockchain } = useWalletKit()
    const [value, setValue] = useState(props.usdBase ? 'Pay with USD-based Amounts' : 'Pay with Token Amounts')
    const [value2, setValue2] = useState(props.compensation)
    const [value3, setValue3] = useState(props.execution === ExecutionType.auto ? ' Auto' : 'Manual')




    const storage = useAppSelector(selectStorage)
    const balance = useAppSelector(SelectBalances)

    const { allow, loading: allowLoading } = useAllowance()
    const { GenerateBatchPay } = useCeloPay()
    const { updateAddress, updateCommand, updateTime, createTask, cancelTask, loading } = useGelato()

    const contributors = useAppSelector(selectContributors).contributors
    const { editMember, isLoading } = useContributors()
    const [member, setMember] = useState<IMember>()

    const [selectedTeam, setSelectedTeam] = useState<DropDownItem>({ name: "No Team", coinUrl: CoinsURL.None })
    const [secondActive, setSecondActive] = useState(false)

    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [selectedExecution, setSelectedExecution] = useState(props.execution === ExecutionType.auto ? true : false)
    const [selectedType, setSelectedType] = useState(props.usdBase)

    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({ name: "Monthly", type: DateInterval.monthly })
    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>({ name: GetCoins[props.currency].name, id: GetCoins[props.currency].name, coinUrl: GetCoins[props.currency].coinUrl });
    const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>({ name: GetCoins[props.currency].name, id: GetCoins[props.currency].name, coinUrl: GetCoins[props.currency].coinUrl });
    const [amount, setAmount] = useState<number>(0)
    const [amount2, setAmount2] = useState<number>(0)






    useEffect(() => {
        setMember(props)
        setSecondActive(!(!props.secondaryAmount))
        if (props.interval) {
            setSelectedFrequency(props.interval === DateInterval.monthly ? { name: "Monthly", type: DateInterval.monthly } : { name: "Weekly", type: DateInterval.weekly })
        }
        if (props.paymantDate) {
            setStartDate(new Date(props.paymantDate))
        }
        if (props.paymantEndDate) {
            setEndDate(new Date(props.paymantEndDate))
        }
        if (props.secondaryCurrency) {
            setSelectedWallet2({ name: GetCoins[props.secondaryCurrency].name, id: GetCoins[props.secondaryCurrency].name, coinUrl: GetCoins[props.secondaryCurrency].coinUrl })
        }
    }, [])

    useEffect(() => {
        if (member && contributors.length > 0) {
            setSelectedTeam({ name: contributors.find(w => w.id === member.teamId)!.name, coinUrl: CoinsURL.None, id: member.teamId })
        }
    }, [member, contributors])

    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { memberName, memberSurname, amount, address, amount2 } = e.target as HTMLFormElement;

        if (memberName && memberSurname && amount && address && selectedWallet && selectedTeam) {
            if (!selectedWallet.name) {
                ToastRun(<>Please, choose a Celo wallet</>)
                return
            }
            if (!selectedTeam.id) {
                ToastRun(<>Please, choose a team</>)
                return
            }
            const memberNameValue = (memberName as HTMLInputElement).value
            const memberSurnameValue = (memberSurname as HTMLInputElement).value
            const amountValue = (amount as HTMLInputElement).value
            const addressValue = (address as HTMLInputElement).value
            const amountValue2 = (amount2 as HTMLInputElement)?.value
            const compensationValue = value2
            // if (addressValue.trim().startsWith("0x")) {
            //     const isAddressExist = kit.web3.utils.isAddress(addressValue.trim());
            //     if (!isAddressExist) throw new Error("There is not any wallet belong this address");
            // }

            try {
                let hash;
                if (props.taskId) {
                    if (selectedExecution) {
                        hash = props.taskId as string;
                        if (props.address !== addressValue) {
                            await updateAddress(hash, addressValue)
                        }
                        if (props.paymantDate !== startDate.toISOString() || props.paymantEndDate !== endDate.toISOString()) {
                            await updateTime(props.taskId as string, startDate.toISOString(), (selectedFrequency.type as DateInterval))
                        }
                        if (props.amount !== amountValue.trim() || props.currency !== selectedWallet.name || props.secondaryAmount !== amountValue2 || props.secondaryCurrency !== selectedWallet2.name) {
                            const interval = selectedFrequency!.type as DateInterval
                            const days = date.subtract(startDate, endDate).toDays();
                            const realDays = interval === DateInterval.monthly ? Math.ceil(days / 30) : interval === DateInterval.weekly ? Math.ceil(days / 7) : days;
                            let realMoney = Number(amountValue) * realDays
                            if (selectedType) {
                                realMoney *= (balance[GetCoins[selectedWallet.name].name]?.tokenPrice ?? 1)
                            }
                            await allow(GetCoins[selectedWallet.name].contractAddress, Contracts.Gelato.address, realMoney.toString())
                            const paymentList: PaymentInput[] = []

                            paymentList.push({
                                coin: GetCoins[selectedWallet.name],
                                recipient: addressValue.trim(),
                                amount: amountValue.trim()
                            })

                            if (amountValue2 && selectedWallet2.name) {
                                let realMoney = Number(amountValue2) * realDays
                                if (selectedType) {
                                    realMoney *= (balance[GetCoins[selectedWallet2.name].name]?.tokenPrice ?? 1)
                                }
                                await allow(GetCoins[selectedWallet2.name].contractAddress, Contracts.Gelato.address, realMoney.toString())
                                paymentList.push({
                                    coin: GetCoins[selectedWallet2.name],
                                    recipient: addressValue.trim(),
                                    amount: amountValue2.trim()
                                })
                            }

                            const encodeAbi = (await GenerateBatchPay(paymentList)).encodeABI()
                            await updateCommand(hash, encodeAbi)
                        }
                    } else {
                        await cancelTask(props.taskId as string)
                    }
                }


                let newMember: IMember = {
                    taskId: null,
                    id: props.id,
                    first: `${memberNameValue}`,
                    name: `${memberNameValue} ${memberSurnameValue}`,
                    last: `${memberSurnameValue}`,
                    address: addressValue.trim(),
                    compensation: compensationValue,
                    amount: amountValue,
                    currency: selectedWallet.name as CoinsName,
                    teamId: selectedTeam.id,
                    usdBase: selectedType,
                    interval: selectedFrequency!.type as DateInterval,
                    execution: value3 === "Auto" ? ExecutionType.auto : ExecutionType.manual,
                    paymantDate: startDate!.toISOString(),
                    paymantEndDate: endDate!.toISOString(),
                    secondaryAmount: amountValue2 ? amountValue2.trim() : null,
                    secondaryCurrency: selectedWallet2?.name ? selectedWallet2.name as CoinsName : null,
                    secondaryUsdBase: amountValue2 ? selectedType : null,
                }

                if (hash) newMember.taskId = hash
                else if (!hash && props.taskId) newMember.taskId = null

                await editMember(props.teamId, props.id, newMember)
                dispatch(changeSuccess({ activate: true, text: "Member updated successfully" }))
            } catch (error: any) {
                console.error(error)
                dispatch(changeError({ activate: true, text: error?.message ?? "There was an error updating the member" }))
            }

        }
    }

    // const paymentname = ["Pay with USD-based Amounts", "Pay with Token Amounts"]
    // const paymentname2 = ["Full Time", "Part Time", "Bounty"]
    // const paymentname3 = ["Manual", "Auto"]
    // const paymentname4 = ["Upload Photo", "NFT"]
    const onSubmit: SubmitHandler<IFormInput> = data => {
        const Photo = file;
        const Team = selectedTeam;
        const Compensation = selectedPayment2.name;
        const Wallet = selectedWallet
        const Wallet2 = selectedWallet2
        const PaymentType = selectedExecution ? "Auto" : "Manual";
        const Frequency = selectedFrequency.name;
        const dateStart = startDate;
        const dateEnd = endDate;
        console.log(data, Photo, Team, Compensation, Wallet, Wallet2, PaymentType, Frequency, dateStart, dateEnd)
    }


    return <>
        <div>
            {!isLoading && member ?
                <form onSubmit={handleSubmit(onSubmit)} >
                    <div className="flex flex-col space-y-8">
                        <div className="text-2xl self-center pt-2 font-semibold ">Edit People</div>
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col mb-4 space-y-1 w-full">
                                <div className=" text-left text-greylish dark:text-white">Choose Profile Photo Type</div>
                                <div className={` flex items-center gap-3 w-full`}>
                                    <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                                        setSelectedPayment(e)
                                        if (e.name === "NFT") setUserIsUpload(false)
                                        else setUserIsUpload(true)
                                    }} />
                                </div>
                            </div>
                            {<div className="flex flex-col mb-4 space-y-1 w-full">
                                <div className="text-xs text-left  dark:text-white">{!userIsUpload ? "NFT Address" : "Your Photo"} </div>
                                <div className={`  w-full border rounded-lg`}>
                                    {!userIsUpload ? <input type="text" {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                                </div>
                            </div>}
                            {blockchain === 'celo' && !userIsUpload && <div className="flex flex-col mb-4 gap-1 w-full">
                                <div className="text-xs text-left  dark:text-white">Token ID</div>
                                <div className={`w-full border rounded-lg`}>
                                    <input type="number" {...register("nftTokenId", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                                </div>
                            </div>}
                            <div className="grid grid-cols-2 gap-x-10">
                                <div>
                                    <div className="text-greylish ">Name</div>
                                    <input type="text" {...register("name", { required: true })} placeholder="First Name" defaultValue={member.first} className="border pl-2 rounded-md outline-none py-2  w-full dark:bg-darkSecond" required />
                                </div>
                                <div>
                                    <div className="text-greylish ">Surname</div>
                                    <input type="text" {...register("surname", { required: true })} placeholder="Last Name" defaultValue={member.last} className="border pl-2 rounded-md outline-none py-2  w-full dark:bg-darkSecond" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-10">
                            <div className="flex flex-col">
                                <div className="text-greylish">Team</div>
                                <div className="w-full ">
                                    <Dropdown onSelect={setSelectedTeam} selected={selectedTeam} list={contributors.length > 0 ? [...contributors.map(w => { return { name: w.name, coinUrl: CoinsURL.None, id: w.id } })] : []} nameActivation={true} className="!py-[0.6rem]  border !rounded-md " />
                                </div>

                            </div>
                            <div className="flex flex-col ">
                                <div className="text-greylish">Compensation Type</div>
                                <div className=" w-full ">
                                    <div>
                                        <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname2} selected={selectedPayment2} onSelect={(e) => {
                                            setSelectedPayment2(e)
                                            if (e.name === "Pay with USD-based Amounts") setSelectedType(true)
                                            else setSelectedType(false)
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <div className="text-greylish">Amount Type</div>
                            <div>
                                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname3} selected={selectedPayment3} onSelect={(e) => {
                                    setSelectedPayment3(e)
                                }} />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <div className="text-greylish">Wallet Address</div>
                            <div>
                                <input type="text"   {...register("address", { required: true })} defaultValue={member.address} className="border pl-2 rounded-md outline-none py-2 w-full dark:bg-darkSecond" placeholder="Wallet Address" required />
                            </div>
                        </div>

                        <div className="flex w-full gap-x-10">
                            {<Dropdown parentClass={'w-full   border-transparent text-sm dark:text-white'} className="!rounded-md !py-3" nameActivation={true} selected={selectedWallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                                setSelectedWallet(val)
                            }} />}
                            <div className={`border w-full text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[80%,20%]" : "grid-cols-[50%,50%]"}`}>
                                <input type="number" defaultValue={member.amount} {...register("amount", { required: true })} className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white " placeholder="Amount" required step={'any'} min={0} />
                                {selectedType && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
                            </div>
                        </div>
                        {secondActive ?
                            <div className="flex gap-x-10">
                                {<Dropdown parentClass={'w-full border-transparent text-sm dark:text-white'} className="!rounded-md !py-3" nameActivation={true} selected={selectedWallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                                    setSelectedWallet2(val)
                                }} />}
                                <div className={`border w-full text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[80%,20%]" : "grid-cols-[50%,50%]"}`}>
                                    <input type="number" {...register("amount2", { required: true })} defaultValue={(member.secondaryAmount ?? 0)} className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white" placeholder="Amount" step={'any'} min={0} />
                                    {selectedType && <span className="text-xs self-center opacity-70 dark:text-white ">USD as</span>}
                                </div>
                            </div> : <div className="text-primary cursor-pointer" onClick={() => setSecondActive(true)}>+ Add another token</div>}
                        <div className="flex gap-x-10">
                            <div className="flex flex-col space-y-4 w-full">
                                <div className="text-greylish">Payment Type</div>
                                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname4} selected={selectedPayment4} onSelect={(e) => {
                                    setSelectedPayment4(e)
                                    if (e.name === "Auto") setSelectedExecution(true)
                                    else setSelectedExecution(false)
                                }} />
                            </div>

                            <div className="flex flex-col space-y-4 w-full">
                                <div className="text-greylish">Payment Frequency</div>
                                <div>
                                    <Dropdown onSelect={setSelectedFrequency} selected={selectedFrequency} list={[{ name: "Monthly", type: DateInterval.monthly }, { name: "Weekly", type: DateInterval.weekly }]} nameActivation={true} className="border !rounded-md !py-[0.7rem]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-x-10">
                            <div className="flex flex-col space-y-4 w-full">
                                <div className="text-greylish">Payment Start Date</div>
                                <div className="border dark:border-darkSecond p-2 rounded-md">
                                    <DatePicker className="dark:bg-dark w-full outline-none" selected={startDate} minDate={new Date()} onChange={(date) => date ? setStartDate(date) : null} />
                                </div>
                            </div>
                            <div className="flex flex-col space-y-4 w-full">
                                <div className="text-greylish">Payment End Date</div>
                                <div className="border dark:border-darkSecond p-2 rounded-md">
                                    <DatePicker className="dark:bg-dark w-full outline-none" selected={endDate} minDate={new Date()} onChange={(date) => date ? setEndDate(date) : null} />
                                </div>
                            </div>
                        </div>
                        {/* {isError && <Error onClose={(val)=>dispatch(changeError({activate: val, text: ''}))} />} */}
                        <div className="grid grid-cols-2 gap-x-10 justify-center">
                            <Button version="second" className="px-8 py-3" onClick={() => { props.onDisable(false) }}>
                                Close
                            </Button>
                            <Button type='submit' className="px-8 py-3" isLoading={isLoading || loading || allowLoading} >
                                Save Person
                            </Button>
                        </div>
                    </div>
                </form>
                : <div className="flex justify-center"> <Loader /></div>}
        </div>
    </>
}

export default EditMember;