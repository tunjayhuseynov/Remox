import React, { SyntheticEvent, useState } from "react";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { useAppDispatch, useAppSelector } from "redux/hooks"
import { changeSuccess, changeError, selectError } from 'redux/slices/notificationSlice'
import DatePicker from "react-datepicker";
import Button from "components/button";
import { DateInterval, ExecutionType, IMember } from "rpcHooks/useContributors";
import { selectContributors } from "redux/slices/account/contributors";
import useContributors from "hooks/useContributors";
import { v4 as uuidv4 } from 'uuid'
import { selectStorage } from "redux/slices/account/storage";
import { useContractKit } from "@celo-tools/use-contractkit";
import useAllowance from "rpcHooks/useAllowance";
import useGelato from "rpcHooks/useGelato";
import useCeloPay, { PaymentInput } from "rpcHooks/useCeloPay";
import { SelectBalances } from "redux/slices/currencies";
import { ToastRun } from "utils/toast";
import { AltCoins, CoinsName, CoinsURL } from "types";
import { useWalletKit } from "hooks";
import Loader from "components/Loader";
import Paydropdown from '../../../../subpages/pay/paydropdown';
import Upload from "components/upload";
import { useForm, SubmitHandler } from "react-hook-form";

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    surname: string;
    address:string;
    amount:number;
    amount2?:number;

}


export default ({ onDisable }: { onDisable: React.Dispatch<boolean> }) => {
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


    const { kit } = useContractKit()
    const storage = useAppSelector(selectStorage)

    const { allow, loading: allowLoading } = useAllowance()
    const { GenerateBatchPay } = useCeloPay()
    const { createTask, loading } = useGelato()
    const balance = useAppSelector(SelectBalances)
    const { GetCoins, blockchain } = useWalletKit()

    const contributors = useAppSelector(selectContributors).contributors
    const { addMember, isLoading } = useContributors()
    const [file, setFile] = useState<File>()
    const [secondActive, setSecondActive] = useState(false)

    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [selectedExecution, setSelectedExecution] = useState(false)
    const [selectedType, setSelectedType] = useState(false)

    const [selected, setSelected] = useState<DropDownItem>(contributors.length > 0 ? { name: "Select Team", coinUrl: CoinsURL.None } : { name: "No Team", coinUrl: CoinsURL.None })
    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({ name: "Monthly", type: DateInterval.monthly })
    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>();
    const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>();
    const [amount, setAmount] = useState<number>(0)
    const [amount2, setAmount2] = useState<number>(0)


    const dispatch = useAppDispatch()

console.log(selectedType)
    // const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
    //     e.preventDefault()

    //     const target = e.target as HTMLFormElement;

    //     const { firstName, lastName, teamName, walletAddress, amount, amount2 } = target;
    //     const firstNameValue = (firstName as HTMLInputElement).value
    //     const lastNameValue = (lastName as HTMLInputElement).value
    //     const compensationValue = value2
    //     // const teamNameValue = (teamName as HTMLInputElement)?.value
    //     const walletAddressValue = (walletAddress as HTMLInputElement).value
    //     const amountValue = (amount as HTMLInputElement).value
    //     const amountValue2 = (amount2 as HTMLInputElement)?.value

    //     if (firstNameValue && lastNameValue && walletAddressValue && amountValue && compensationValue) {
    //         if (!Object.values(GetCoins).includes(selectedWallet as AltCoins)) {
    //             ToastRun(<>Please, choose a Celo wallet</>)
    //             return
    //         }
    //         if (selected.name === "Select Team") {
    //             ToastRun(<>Please, choose a team</>)
    //             return
    //         }

    //         if (selectedWallet.name && selected.id) {

    //             try {

    //                 if (walletAddressValue.trim().startsWith("0x")) {
    //                     const isAddressExist = kit.web3.utils.isAddress(walletAddressValue.trim());
    //                     if (!isAddressExist) throw new Error("There is not any wallet belong this address");
    //                 }

    //                 let sent: IMember = {
    //                     taskId: null,
    //                     id: uuidv4(),
    //                     first: `${firstNameValue}`,
    //                     name: `${firstNameValue} ${lastNameValue}`,
    //                     last: `${lastNameValue}`,
    //                     address: walletAddressValue.trim(),
    //                     compensation: compensationValue,
    //                     currency: selectedWallet.name as CoinsName,
    //                     amount: parseFloat(amountValue.trim()).toString(),
    //                     teamId: selected.id,
    //                     usdBase: selectedType,
    //                     execution: value3 === "Auto" ? ExecutionType.auto : ExecutionType.manual,
    //                     interval: selectedFrequency!.type as DateInterval,
    //                     paymantDate: startDate!.toISOString(),
    //                     paymantEndDate: endDate!.toISOString(),
    //                     secondaryAmount: amountValue2 ? parseFloat(amountValue2.trim()).toString() : null,
    //                     secondaryCurrency: selectedWallet2?.name ? selectedWallet2.name as CoinsName : null,
    //                     secondaryUsdBase: amountValue2 ? selectedType : null,
    //                 }

    //                 await addMember(selected.id, sent)

    //                 dispatch(changeSuccess({ activate: true, text: "Member is added successfully" }))
    //                 onDisable(false)
    //             } catch (error: any) {
    //                 console.error(error)
    //                 dispatch(changeError({ activate: true, text: error.message }))
    //             }
    //         }
    //     }
    // }


    const onSubmit: SubmitHandler<IFormInput> = data => {
        const Photo = file;
        const Team = selected;
        const Compensation = selectedPayment2.name;
        const Wallet = selectedWallet
        const Wallet2 = selectedWallet2
        const PaymentType = selectedExecution ? "Auto" : "Manual";
        const Frequency = selectedFrequency.name;
        const dateStart = startDate;
        const dateEnd = endDate;
        console.log(data,Photo,Team,Compensation,Wallet,Wallet2,PaymentType,Frequency,dateStart,dateEnd)
    }


    return <>
        <form onSubmit={handleSubmit(onSubmit)} >
            <div className="flex flex-col space-y-8 w-[35%] mx-auto pb-4">
                <div className="text-2xl self-center pt-2 font-semibold ">Add People</div>
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
                            {!userIsUpload ? <input type="text"  {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
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
                            <input type="text" {...register("name", { required: true })}  placeholder="First Name" className="border pl-2 rounded-md outline-none py-3  w-full dark:bg-darkSecond" required />
                        </div>
                        <div>
                            <div className="text-greylish ">Surname</div>
                            <input type="text" {...register("surname", { required: true })}  placeholder="Last Name" className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond" required />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-10">
                    <div className="flex flex-col">
                        <div className="text-greylish">Team</div>
                        <div className="w-full ">
                            <Dropdown onSelect={setSelected} selected={selected} list={contributors.length > 0 ? [...contributors.map(w => { return { name: w.name, coinUrl: CoinsURL.None, id: w.id } })] : []} nameActivation={true} parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} />
                        </div>
                    </div>
                    <div className="flex flex-col ">
                        <div className="text-greylish">Compensation Type</div>
                        <div className=" w-full ">
                            <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname2} selected={selectedPayment2} onSelect={(e) => {
                                setSelectedPayment2(e)

                            }} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-1">
                    <div className="text-greylish">Amount Type</div>
                    <div>
                        <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname3} selected={selectedPayment3} onSelect={(e) => {
                            setSelectedPayment3(e)
                            if (e.name === "Pay with USD-based Amounts") setSelectedType(true)
                            else setSelectedType(false)
                        }} />
                    </div>
                </div>
                <div className="flex flex-col space-y-1">
                    <div className="text-greylish">Wallet Address</div>
                    <div>
                        <input type="text"  {...register("address", { required: true })}  className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond" placeholder="Wallet Address" required />
                    </div>
                </div>
                <div className="flex w-full gap-x-10">
                    {<Dropdown parentClass={'w-full   border-transparent text-sm dark:text-white'} className="!rounded-md !py-3" nameActivation={true} selected={selectedWallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                            setSelectedWallet(val)
                        }}  />}
                    <div className={`border w-full text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[80%,20%]" : "grid-cols-[50%,50%]"}`}>
                        <input type="number" {...register("amount", { required: true })}  className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white " placeholder="Amount" required step={'any'} min={0} onChange={(e)=>{setAmount(parseInt(e.target.value))}} />
                        {selectedType && <span className="text-xs self-center opacity-70 dark:text-white">USD as</span>}
                    </div>
                </div>
                {secondActive ?
                    <div className="flex gap-x-10">
                        { <Dropdown parentClass={'w-full border-transparent text-sm dark:text-white'} className="!rounded-md !py-3" nameActivation={true} selected={selectedWallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                            setSelectedWallet2(val)
                        }}  />}
                        <div className={`border w-full text-black py-1 rounded-md grid ${selectedType ? "grid-cols-[80%,20%]" : "grid-cols-[50%,50%]"}`}>
                            <input type="number" {...register("amount2", { required: true })} className="outline-none unvisibleArrow pl-2 dark:bg-dark dark:text-white" placeholder="Amount" step={'any'} min={0} onChange={(e)=>{setAmount2(parseInt(e.target.value))}} />
                            {selectedType && <span className="text-xs self-center opacity-70 dark:text-white ">USD as</span>}
                        </div>
                    </div> : <div className="text-primary cursor-pointer" onClick={() => setSecondActive(true)}>+ Add another token</div>}
                <div className="flex gap-x-10">
                    <div className="flex flex-col space-y-1 w-full">
                        <div className="text-greylish">Payment Type</div>
                        <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname4} selected={selectedPayment4} onSelect={(e) => {
                            setSelectedPayment4(e)
                            if (e.name === "Auto") setSelectedExecution(true)
                            else setSelectedExecution(false)
                        }} />
                    </div>

                    <div className="flex flex-col space-y-1 w-full">
                        <div className="text-greylish">Payment Frequency</div>
                        <div>
                            <Dropdown onSelect={setSelectedFrequency} selected={selectedFrequency} list={[{ name: "Monthly", type: DateInterval.monthly }, { name: "Weekly", type: DateInterval.weekly }]} nameActivation={true} className="border !rounded-md !py-[0.7rem]" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-x-10">
                    <div className="flex flex-col space-y-1 w-full">
                        <div className="text-greylish">Payment Start Date</div>
                        <div className="border dark:border-darkSecond p-2 rounded-md">
                            <DatePicker className="dark:bg-dark w-full outline-none" selected={startDate} minDate={new Date()} onChange={(date) => date ? setStartDate(date) : null} />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                        <div className="text-greylish">Payment End Date</div>
                        <div className="border dark:border-darkSecond p-2 rounded-md">
                            <DatePicker className="dark:bg-dark w-full outline-none" selected={endDate} minDate={new Date()} onChange={(date) => date ? setEndDate(date) : null} />
                        </div>
                    </div>
                </div>
                {/* {isError && <Error onClose={(val)=>dispatch(changeError({activate: val, text: ''}))} />} */}
                <div className="grid grid-cols-2 gap-x-10 justify-center">
                    <Button type="submit" version="second" className="px-8 py-3" onClick={() => { onDisable(false) }}>
                        Close
                    </Button>
                    <Button type="submit" className="px-8 py-3" isLoading={isLoading || loading || allowLoading}>
                        Add Person
                    </Button>
                </div>
            </div>
        </form>
    </>
}
