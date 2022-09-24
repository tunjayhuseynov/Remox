import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectAccountType, SelectBlockchain, SelectFiatPreference, SelectID, SelectIndividual, SelectOrganization, SelectPriceCalculation } from "redux/slices/account/selector";
import EditableTextInput from "components/general/EditableTextInput";
import EditableAvatar from "components/general/EditableAvatar";
import { UpdateFiatCurrencyThunk, UpdatePriceCalculationThunk, UpdateProfileImageThunk, UpdateProfileNameThunk } from "redux/slices/account/thunks/profile";
import { ToastRun } from "utils/toast";
import Dropdown from "components/general/dropdown";
import { useState } from 'react'
import { FiatMoneyList, PriceCalculationList } from "firebaseConfig";

export interface IOrgData {
    orgPhoto?: File,
    orgName: string,
    name: string,
    photo?: File
}


const ProfileSetting = () => {

    const blockchain = useAppSelector(SelectBlockchain)
    const dispatch = useAppDispatch()

    const individual = useAppSelector(SelectIndividual)
    const organization = useAppSelector(SelectOrganization)
    const preference = useAppSelector(SelectFiatPreference)
    const priceCalculation = useAppSelector(SelectPriceCalculation)

    const [selectedFiatCurrency, SetSelectedFiatCurrency] = useState({ name: preference })
    const [selectedPriceCalculation, SetSelectedPriceCalculation] = useState({ name: priceCalculation, displayName: `${priceCalculation === "current" ? "Curren Price" : `${priceCalculation} days average`}` })

    const type = useAppSelector(SelectAccountType)
    const id = useAppSelector(SelectID)
    const isOrganization = type === "organization" ? true : false

    const onOrganizationImageChange = async (url: string, type: "image" | "nft") => {
        if (!id) return ToastRun(<>Cannot find your session id</>, "error")
        await dispatch(
            UpdateProfileImageThunk({
                accountType: "organization",
                type,
                url,
                userId: id,
            })
        )
    }
    const onindiviudalImageChange = async (url: string, type: "image" | "nft") => {
        if (!id) return ToastRun(<>Cannot find your session id</>, "error")
        await dispatch(
            UpdateProfileImageThunk({
                accountType: "individual",
                type,
                url,
                userId: id,
            })
        )
    }

    const onOrganizationNameChange = async (name: string) => {
        if (!id) return ToastRun(<>Cannot find your session id</>, "error")
        await dispatch(UpdateProfileNameThunk({
            name: name,
            accountType: "organization",
            userId: id
        }))
    }

    const onIndividualNameChange = async (name: string) => {
        if (!id) return ToastRun(<>Cannot find your session id</>, "error")
        await dispatch(UpdateProfileNameThunk({
            name: name,
            accountType: "individual",
            userId: id
        }))
    }



    return <div className=" py-5 flex flex-col space-y-10">
        <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 grid grid-cols-[25%,25%,50%] items-center py-6">
            <div className="text-lg font-semibold self-center">Fiat Currency</div>
            <div className="flex">
                <Dropdown
                    list={["USD", "AUD", "CAD", "EUR", "GBP", "JPY", "TRY"].map(s => ({ name: (s as FiatMoneyList) }))}
                    selected={selectedFiatCurrency}
                    setSelect={SetSelectedFiatCurrency}
                    runFn={(val) => async () => {
                        await dispatch(UpdateFiatCurrencyThunk(val.name))
                    }}
                />
            </div>
            <div></div>
        </div>
        <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 grid grid-cols-[25%,25%,50%] items-center py-6">
            <div className="text-lg font-semibold self-center">Token Price Calculation</div>
            <div className="flex">
                <Dropdown
                    list={[
                        { name: "current", displayName: "Current Price" },
                        { name: "5", displayName: "5 days average" },
                        { name: "10", displayName: "10 days average" },
                        { name: "15", displayName: "15 days average" },
                        { name: "20", displayName: "20 days average" },
                        { name: "30", displayName: "30 days average" },
                    ].map(s => ({ name: (s.name as PriceCalculationList), displayName: s.displayName }))}
                    selected={selectedPriceCalculation}
                    setSelect={SetSelectedPriceCalculation}
                    runFn={(val) => async () => {
                        await dispatch(UpdatePriceCalculationThunk(val.name))
                    }}
                />
            </div>
            <div></div>
        </div>
        <div className="w-full pt-2 pb-2 grid grid-rows-2 ">
            {isOrganization &&
                <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 grid grid-cols-[25%,25%,50%] items-center py-6">
                    <div className="text-lg font-semibold pt-2 self-center">Organisation Photo</div>
                    <div className="flex">
                        <EditableAvatar
                            avatarUrl={(typeof organization?.image?.imageUrl === "string" ? organization?.image?.imageUrl : null) ?? organization?.image?.nftUrl ?? null}
                            name={id ?? "random"}
                            blockchain={blockchain}
                            evm={blockchain.name !== "solana"}
                            userId={id ?? undefined}
                            onChange={onOrganizationImageChange}
                        />
                    </div>
                    <div></div>
                </div>}
            {isOrganization &&
                <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 grid grid-cols-[25%,25%,50%] items-center py-6">
                    <div className="text-lg font-semibold self-center">Organisation Name</div>
                    <EditableTextInput defaultValue={organization?.name ?? ""} onSubmit={onOrganizationNameChange} placeholder="Name" />
                </div>
            }
            <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 grid grid-cols-[25%,25%,50%] items-center py-6">
                <span className="text-lg font-semibold pt-2 self-center">Your Photo</span>
                <div className="flex">
                    <EditableAvatar
                        avatarUrl={(typeof individual?.image?.imageUrl === "string" ? individual?.image?.imageUrl : null) ?? individual?.image?.nftUrl ?? null}
                        name={id ?? "random"}
                        blockchain={blockchain}
                        evm={blockchain.name !== "solana"}
                        userId={id ?? undefined}
                        onChange={onindiviudalImageChange}
                    />
                </div>
                <div></div>
            </div>
            <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 grid grid-cols-[25%,25%,50%] items-center py-6">
                <div className="text-lg font-semibold self-center">Your Name</div>
                <EditableTextInput defaultValue={individual?.name ?? ""} onSubmit={onIndividualNameChange} placeholder="Individual account name" />
                <div></div>
            </div>
        </div>
    </div>
}

export default ProfileSetting;