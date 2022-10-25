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
    const fiatList = [
        {
            name: "AUD",
            logo: "https://cdn.countryflags.com/thumbs/australia/flag-400.png"
        },
        {
            name: "CAD",
            logo: "https://cdn.countryflags.com/thumbs/canada/flag-400.png"
        },
        {
            name: "EUR",
            logo: "https://cdn.countryflags.com/thumbs/europe/flag-400.png"
        },
        {
            name: "GBP",
            logo: "https://cdn.countryflags.com/thumbs/united-kingdom/flag-400.png"
        },
        {
            name: "JPY",
            logo: "https://cdn.countryflags.com/thumbs/japan/flag-400.png"
        },
        {
            name: "USD",
            logo: "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-400.png"
        },
        {
            name: "TRY",
            logo: "https://cdn.countryflags.com/thumbs/turkey/flag-400.png"
        },
    ]


    const blockchain = useAppSelector(SelectBlockchain)
    const dispatch = useAppDispatch()

    const individual = useAppSelector(SelectIndividual)
    const organization = useAppSelector(SelectOrganization)
    const preference = useAppSelector(SelectFiatPreference)
    const priceCalculation = useAppSelector(SelectPriceCalculation)

    const [selectedFiatCurrency, SetSelectedFiatCurrency] = useState({ name: preference, logoURI: fiatList.find(x => x.name === preference)?.logo })
    const [selectedPriceCalculation, SetSelectedPriceCalculation] = useState({ name: priceCalculation, displayName: `${priceCalculation === "current" ? "Current Price" : `${priceCalculation} days average`}` })

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



    return <div className="py-5 grid grid-flow-row grid-rows-6 gap-y-3">
        <div className="w-full bg-white dark:bg-darkSecond rounded-md shadow-custom px-5 grid grid-cols-[25%,25%,50%] items-center py-3">
            <div className="text-base font-medium">Fiat Currency</div>
            <div className="flex">
                <Dropdown
                    nonrounded
                    parentClass="w-[10rem]"
                    className=""
                    list={fiatList.map(s => ({ name: (s.name as FiatMoneyList), logoURI: s.logo }))}
                    selected={selectedFiatCurrency}
                    setSelect={SetSelectedFiatCurrency}
                    runFn={(val) => async () => {
                        await dispatch(UpdateFiatCurrencyThunk(val.name))
                    }}
                />
            </div>
            <div></div>
        </div>
        <div className="w-full bg-white dark:bg-darkSecond rounded-md shadow-custom px-5 grid grid-cols-[25%,25%,50%] items-center py-3">
            <div className="text-base font-medium">Token Price Calculation</div>
            <div className="flex ">
                <Dropdown
                    parentClass="w-[10rem]"
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
        {isOrganization &&
            <div className="w-full bg-white dark:bg-darkSecond rounded-md shadow-custom px-5 grid grid-cols-[25%,25%,50%] items-center !py-1">
                <div className="text-base font-medium self-center">Organisation Photo</div>
                <div className="flex">
                    <EditableAvatar
                        avatarUrl={(typeof organization?.image?.imageUrl === "string" ? organization?.image?.imageUrl : null) ?? organization?.image?.nftUrl ?? null}
                        name={id ?? "random"}
                        size={3.8}
                        blockchain={blockchain}
                        evm={blockchain.name !== "solana"}
                        userId={id ?? undefined}
                        onChange={onOrganizationImageChange}
                    />
                </div>
                <div></div>
            </div>}
        {isOrganization &&
            <div className="w-full bg-white dark:bg-darkSecond rounded-md shadow-custom px-5 grid grid-cols-[25%,20%,55%] items-center py-3">
                <div className="text-base font-medium self-center">Organisation Name</div>
                <EditableTextInput defaultValue={organization?.name ?? ""} onSubmit={onOrganizationNameChange} placeholder="Name" />
            </div>
        }
        <div className="w-full bg-white dark:bg-darkSecond rounded-md shadow-custom px-5 grid grid-cols-[25%,25%,50%] items-center py-3">
            <span className="text-base font-medium self-center">Your Photo</span>
            <div className="flex">
                <EditableAvatar
                    avatarUrl={(typeof individual?.image?.imageUrl === "string" ? individual?.image?.imageUrl : null) ?? individual?.image?.nftUrl ?? null}
                    name={id ?? "random"}
                    size={3.7}
                    blockchain={blockchain}
                    evm={blockchain.name !== "solana"}
                    userId={id ?? undefined}
                    onChange={onindiviudalImageChange}
                />
            </div>
            <div></div>
        </div>
        <div className="w-full bg-white dark:bg-darkSecond rounded-md shadow-custom px-5 grid grid-cols-[25%,20%,55%] items-center py-3">
            <div className="text-base font-medium self-center">Your Name</div>
            <EditableTextInput defaultValue={individual?.name ?? ""} onSubmit={onIndividualNameChange} placeholder="Individual account name" />
            <div></div>
        </div>
    </div>
}

export default ProfileSetting;