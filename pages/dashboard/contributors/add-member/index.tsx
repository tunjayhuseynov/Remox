import React, { useMemo, useState } from "react";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import DatePicker from "react-datepicker";
import Button from "components/button";
import { DateInterval, ExecutionType, IMember } from "rpcHooks/useContributors";
import { SelectContributors } from "redux/slices/account/remoxData";
import useContributors from "hooks/useContributors";
import { v4 as uuidv4 } from "uuid";
import useAllowance from "rpcHooks/useAllowance";
import useGelato from "rpcHooks/useGelato";
import { SelectBalances } from "redux/slices/currencies";
import { CoinsName, CoinsURL } from "types";
import { useWalletKit } from "hooks";
import Upload from "components/upload";
import { useForm, SubmitHandler } from "react-hook-form";
import { UploadNFTorImageForUser } from "hooks/singingProcess/utils";
import { addMemberToContributor } from "redux/slices/account/remoxData";
import { useRouter } from 'next/router';

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    surname: string;
    address: string;
    amount: number;
    amount2?: number;
    role: string;
}

export default () => {
    const navigate = useRouter()
    const { register, handleSubmit } = useForm<IFormInput>();
    const [userIsUpload, setUserIsUpload] = useState<boolean>(true);

    const imageType: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }];
    const [selectedPayment, setSelectedPayment] = useState(imageType[0]);

    const paymentname2: DropDownItem[] = [
        { name: "Full Time" },
        { name: "Part Time" },
        { name: "Bounty" },
    ];
    const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0]);

    const paymentname3: DropDownItem[] = [
        { name: "Pay with Token Amounts" },
        { name: "Pay with USD-based Amounts" },
    ];
    const [selectedPayment3, setSelectedPayment3] = useState(paymentname3[0]);

    const paymentname4: DropDownItem[] = [{ name: "Manual" }, { name: "Auto" }];
    const [selectedPayment4, setSelectedPayment4] = useState(paymentname4[0]);

    const { loading: allowLoading } = useAllowance();

    const { loading } = useGelato();
    const balance = useAppSelector(SelectBalances);
    const { GetCoins, blockchain } = useWalletKit();
    const DropDownCoins = useMemo(
        () =>
            Object.values(GetCoins!).map((w) => ({
                name: w.name,
                coinUrl: w.coinUrl,
            })),
        [GetCoins]
    );

    const contributors = useAppSelector(SelectContributors);
    const { addMember, isLoading } = useContributors();
    const [file, setFile] = useState<File>();
    const [secondActive, setSecondActive] = useState(false);

    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [selectedExecution, setSelectedExecution] = useState(false);
    const [selectedType, setSelectedType] = useState(false);

    const [selected, setSelected] = useState<DropDownItem>(
        contributors.length > 0
            ? { name: "Select Team", coinUrl: CoinsURL.None }
            : { name: "No Team", coinUrl: CoinsURL.None }
    );
    const [selectedFrequency, setSelectedFrequency] = useState<DropDownItem>({
        name: "Monthly",
        type: DateInterval.monthly,
    });
    const [selectedWallet, setSelectedWallet] = useState<DropDownItem>(
        DropDownCoins[0]
    );
    const [selectedWallet2, setSelectedWallet2] = useState<DropDownItem>();
    const [amount, setAmount] = useState<number>(0);
    const [amount2, setAmount2] = useState<number>(0);

    const dispatch = useAppDispatch();

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        const Photo = file;
        const Team = selected;
        const Compensation = selectedPayment2.name;
        const Wallet = selectedWallet;
        const Wallet2 = selectedWallet2;
        const PaymentType = selectedExecution ? "Auto" : "Manual";
        const Frequency = selectedFrequency.name;
        const dateStart = startDate;
        const dateEnd = endDate;

        try {
            let image: Parameters<typeof UploadNFTorImageForUser>[0] | undefined;
            if (Photo || data.nftAddress) {
                image = {
                    image: {
                        blockchain,
                        imageUrl: Photo ?? data.nftAddress!,
                        nftUrl: data.nftAddress ?? "",
                        tokenId: data.nftTokenId ?? null,
                        type: imageType ? "image" : "nft",
                    },
                    name: `individuals/${data.name}`,
                };
                await UploadNFTorImageForUser(image);
            }

            let sent: IMember = {
                taskId: null,
                id: uuidv4(),
                first: `${data.name}`,
                name: `${data.name} ${data.surname}`,
                last: `${data.surname}`,
                role: `${data.role}`,
                address: data.address,
                image: image ? image.image : null,
                compensation: Compensation,
                currency: Wallet.name as CoinsName,
                amount: data.amount.toString(),
                teamId: Team.id!.toString(),
                usdBase: selectedType,
                execution:
                    PaymentType === "Auto" ? ExecutionType.auto : ExecutionType.manual,
                interval: Frequency as DateInterval,
                paymantDate: dateStart!.toISOString(),
                paymantEndDate: dateEnd!.toISOString(),
                secondaryAmount: data.amount2 ? data.amount2.toString() : null,
                secondaryCurrency: Wallet2?.name ? (Wallet2.name as CoinsName) : null,
                secondaryUsdBase: data.amount2 ? selectedType : null,
            };

            await addMember(Team.id!.toString(), sent);
            dispatch(addMemberToContributor({ id: Team.id!.toString(), member: sent }));
            navigate.back()
        } catch (error: any) {
            console.error(error);
        }
    };


    return <>
        <form onSubmit={handleSubmit(onSubmit)} className="relative w-full mx-auto">
            <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2">
                {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                <span className="text-4xl pb-1">&#171;</span> Back
            </button>
            <div>
                <div className="flex flex-col space-y-8 w-[40%] mx-auto pb-4">
                    <div className="text-2xl self-center pt-2 font-semibold ">Add People</div>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col mb-4 space-y-1 w-full">
                            <div className=" text-left  text-greylish ">Choose Profile Photo Type</div>
                            <div className={` flex items-center gap-3 w-full`}>
                                <Dropdown parentClass={'bg-white w-full rounded-lg '} className={'!rounded-lg !border dark:border-white h-[3.15rem]'} childClass={'!rounded-lg'} list={imageType} selected={selectedPayment} onSelect={(e) => {
                                    setSelectedPayment(e)
                                    if (e.name === "NFT") setUserIsUpload(false)
                                    else setUserIsUpload(true)
                                }} />
                            </div>
                        </div>
                        {<div className="flex flex-col mb-4 space-y-1 w-full">
                            <div className=" text-left text-greylish">{!userIsUpload ? "NFT Address" : "Your Photo"} </div>
                            <div className={`  w-full border rounded-lg`}>
                                {!userIsUpload ? <input type="text"  {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.15rem]  w-full px-1" /> : <Upload className={'!h-[3.15rem] block border-none w-full'} setFile={setFile} />}
                            </div>
                        </div>}
                        {blockchain === 'celo' && !userIsUpload && <div className="flex flex-col mb-4 gap-1 w-full">
                            <div className=" text-left text-greylish">Token ID</div>
                            <div className={`w-full border rounded-lg`}>
                                <input type="number" {...register("nftTokenId", { required: true, valueAsNumber: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.15rem] unvisibleArrow  w-full px-1" />
                            </div>
                        </div>}
                        <div className="grid grid-cols-2 gap-x-10">
                            <div>
                                <div className="text-greylish ">Name</div>
                                <input type="text" {...register("name", { required: true })} placeholder="First Name" className="border pl-2 rounded-md outline-none py-3  w-full dark:bg-darkSecond" required />
                            </div>
                            <div>
                                <div className="text-greylish ">Surname</div>
                                <input type="text" {...register("surname", { required: true })} placeholder="Last Name" className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond" required />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10">
                        <div className="flex flex-col">
                            <div className="text-greylish">Team</div>
                            <div className="w-full ">
                                <Dropdown onSelect={setSelected} selected={selected} list={contributors.length > 0 ? [...contributors.map(w => { return { name: w.name, coinUrl: CoinsURL.None, id: w.id } })] : []} nameActivation={true} parentClass={'bg-white w-full rounded-lg h-[3.15rem]'} className={'!rounded-lg h-[3.15rem] border dark:border-white'} childClass={'!rounded-lg'} />
                            </div>
                        </div>
                        <div className="flex flex-col ">
                            <div className="text-greylish">Compensation Type</div>
                            <div className=" w-full ">
                                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.15rem]'} className={'!rounded-lg h-[3.15rem] border dark:border-white'} childClass={'!rounded-lg '} list={paymentname2} selected={selectedPayment2} onSelect={(e) => {
                                    setSelectedPayment2(e)

                                }} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10">
                        <div>
                            <div className="text-greylish">Amount Type</div>
                            <div>
                                <Dropdown parentClass={'bg-white w-full rounded-lg '} className={'!rounded-lg !h-[3.15rem] border dark:border-white'} childClass={'!rounded-lg'} list={paymentname3} selected={selectedPayment3} onSelect={(e) => {
                                    setSelectedPayment3(e)
                                    if (e.name === "Pay with USD-based Amounts") setSelectedType(true)
                                    else setSelectedType(false)
                                }} />
                            </div>
                        </div>
                        <div>
                            <div className="text-greylish ">Role</div>
                            <input type="text" {...register("role", { required: true })} placeholder="Role" className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond" required />
                        </div>
                    </div>
                    <div className="flex w-full gap-x-10">
                        {<Dropdown parentClass={'w-full   border-transparent text-sm dark:text-white'} className="!rounded-md !h-[3.15rem]  border dark:border-white" nameActivation={true} selected={selectedWallet ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                            setSelectedWallet(val)
                        }} />}
                        <div className={`border w-full text-black py-1 bg-white dark:bg-darkSecond rounded-md grid ${selectedType ? "grid-cols-[25%,75%]" : "grid-cols-[50%,50%]"}`}>
                            {selectedType && <span className="text-sm self-center pl-2 pt-1 opacity-70 dark:text-white">USD as</span>}
                            <input type="number" {...register("amount", { required: true, valueAsNumber: true })} placeholder="Amount" className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond  dark:text-white " required step={'any'} min={0} onChange={(e) => { setAmount(parseInt(e.target.value)) }} />
                        </div>
                    </div>
                    {secondActive ?
                        <div className="flex gap-x-10">
                            {<Dropdown parentClass={'w-full border-transparent text-sm dark:text-white'} className="!rounded-md !h-[3.15rem] border dark:border-white" nameActivation={true} selected={selectedWallet2 ?? Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))[0]} list={Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl }))} onSelect={val => {
                                setSelectedWallet2(val)
                            }} />}
                            <div className={`border w-full text-black py-1 bg-white dark:bg-darkSecond rounded-md grid ${selectedType ? "grid-cols-[25%,75%]" : "grid-cols-[50%,50%]"}`}>
                                {selectedType && <span className="text-sm self-center pl-2 pt-1 opacity-70 dark:text-white">USD as</span>}
                                <input type="number" {...register("amount2", { required: true, valueAsNumber: true })} placeholder="Amount" className="outline-none unvisibleArrow pl-2 bg-white dark:bg-darkSecond dark:text-white" step={'any'} min={0} onChange={(e) => { setAmount2(parseInt(e.target.value)) }} />
                            </div>
                        </div> : <div className="text-primary cursor-pointer" onClick={() => setSecondActive(true)}> <span className="px-2 text-primary border-primary ">+</span> Add another token</div>}
                    <div className="flex flex-col space-y-1">
                        <div className="text-greylish">Wallet Address</div>
                        <div>
                            <input type="text"  {...register("address", { required: true })} className="border pl-2 rounded-md outline-none py-3 w-full dark:bg-darkSecond" placeholder="Wallet Address" required />
                        </div>
                    </div>
                    <div className="flex gap-x-10">
                        <div className="flex flex-col space-y-1 w-full">
                            <div className="text-greylish">Payment Type</div>
                            <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.15rem]'} className={'!rounded-lg h-[3.15rem] border dark:border-white'} childClass={'!rounded-lg'} list={paymentname4} selected={selectedPayment4} onSelect={(e) => {
                                setSelectedPayment4(e)
                                if (e.name === "Auto") setSelectedExecution(true)
                                else setSelectedExecution(false)
                            }} />
                        </div>

                        <div className="flex flex-col space-y-1 w-full">
                            <div className="text-greylish">Payment Frequency</div>
                            <div>
                                <Dropdown onSelect={setSelectedFrequency} selected={selectedFrequency} list={[{ name: "Monthly", type: DateInterval.monthly }, { name: "Weekly", type: DateInterval.weekly }]} nameActivation={true} className="border dark:border-white !rounded-md !py-[0.7rem] " />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-x-10">
                        <div className="flex flex-col space-y-1 w-full">
                            <div className="text-greylish">Payment Start Date</div>
                            <div className="border  dark:bg-darkSecond bg-white  rounded-md">
                                <DatePicker className="dark:bg-darkSecond bg-white w-full outline-none h-[3.15rem] pl-2" selected={startDate} minDate={new Date()} onChange={(date) => date ? setStartDate(date) : null} />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1 w-full">
                            <div className="text-greylish">Payment End Date</div>
                            <div className="border  dark:bg-darkSecond bg-white  rounded-md">
                                <DatePicker className="dark:bg-darkSecond bg-white w-full outline-none h-[3.15rem] pl-2" selected={endDate} minDate={new Date()} onChange={(date) => date ? setEndDate(date) : null} />
                            </div>
                        </div>
                    </div>
                    {/* {isError && <Error onClose={(val)=>dispatch(changeError({activate: val, text: ''}))} />} */}
                    <div className="grid grid-cols-2 gap-x-10 justify-center">
                        <Button version="second" className="px-8 py-3" onClick={() => navigate.back()}>
                            Close
                        </Button>
                        <Button type="submit" className="px-8 py-3" isLoading={isLoading || loading || allowLoading}>
                            Add Person
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    </>
};
