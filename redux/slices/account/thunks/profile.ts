import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { FiatMoneyList, Image } from "firebaseConfig";
import { IHpApiResponse } from "pages/api/calculation/hp.api";
import { RootState } from "redux/store";
import { FirestoreWrite } from "rpcHooks/useFirebase";
import { changeImage } from "../remoxData";
import { Update_Account_Image } from 'redux/slices/account/thunks/account'
import { Update_Account_Member_Image_Thunk } from 'redux/slices/account/thunks/accountMembers'

interface IProps { accountType: "individual" | "organization", name: string, userId: string }
export const UpdateProfileNameThunk = createAsyncThunk<IProps, IProps>("remoxData/updateProfileName", async ({ accountType: type, userId, name }, api) => {

    try {
        if (!userId) throw new Error('Account is not defined')
        await FirestoreWrite<{
            name: string,
        }>().updateDoc(type === "individual" ? "individuals" : "organizations", userId, {
            name: name,
        })

    } catch (error) {
        console.log(error)
    }

    return { accountType: type, userId, name };
})

interface IImageProps { url: string, type: "image" | "nft", accountType: "individual" | "organization", userId: string }
export const UpdateProfileImageThunk = createAsyncThunk<IImageProps, IImageProps>("remoxData/updateProfileImage", async ({ url, type, accountType, userId }, api) => {

    if (!userId) throw new Error('Account is not defined')
    const state = api.getState() as RootState;
    await FirestoreWrite<{
        image: Image,
    }>().updateDoc(accountType === "individual" ? "individuals" : "organizations", userId, {
        image: {
            blockchain: (api.getState() as RootState).remoxData.blockchain.name,
            imageUrl: url,
            nftUrl: url,
            tokenId: null,
            type: type
        },
    })

    for (const account of state.remoxData.accounts) {
        if (account.address.toLowerCase() === state.remoxData.providerAddress?.toLowerCase()) {
            await api.dispatch(Update_Account_Image({
                account: account,
                image: {
                    blockchain: (api.getState() as RootState).remoxData.blockchain.name,
                    imageUrl: url,
                    nftUrl: url,
                    tokenId: null,
                    type: type
                },
            }))

            for (const member of account.members) {
                if (member.address.toLowerCase() === state.remoxData.providerAddress?.toLowerCase()) {
                    await api.dispatch(Update_Account_Member_Image_Thunk({
                        accountId: account.id,
                        memberId: member.id,
                        image: {
                            blockchain: (api.getState() as RootState).remoxData.blockchain.name,
                            imageUrl: url,
                            nftUrl: url,
                            tokenId: null,
                            type: type
                        },
                    }))
                }
            }
        }
    }

    api.dispatch(changeImage({
        image: {
            blockchain: (api.getState() as RootState).remoxData.blockchain.name,
            imageUrl: url,
            nftUrl: url,
            tokenId: null,
            type: type
        },
        type: accountType
    }))


    return { url, type, accountType, userId };
})

interface ISeendTimeProps { time: number, userId: string }
export const UpdateSeemTimeThunk = createAsyncThunk<ISeendTimeProps, ISeendTimeProps>("remoxData/updateProfileSeenTime", async ({ time, userId }, api) => {

    if (!userId) throw new Error('Account is not defined')
    await FirestoreWrite<{
        seenTime: number,
    }>().updateDoc("individuals", userId, {
        seenTime: time,
    })

    return { time, userId };
})


export const UpdateFiatCurrencyThunk = createAsyncThunk<[FiatMoneyList], FiatMoneyList>("remoxData/updateFiatCurrency", async (currency, api) => {
    const type = (api.getState() as RootState).remoxData.accountType
    const userId = (api.getState() as RootState).remoxData.storage?.organization?.id ?? (api.getState() as RootState).remoxData.storage?.individual?.id
    if (!userId) throw new Error('Account is not defined')
    await FirestoreWrite<{
        fiatMoneyPreference: FiatMoneyList,
    }>().updateDoc(type === "individual" ? "individuals" : "organizations", userId, {
        fiatMoneyPreference: currency,
    })

    const state = api.getState() as RootState
    const allCumulativeTransactions = state.remoxData.cumulativeTransactions;
    const blockchain = state.remoxData.blockchain;

    // const hpList = await axios.post<IHpApiResponse>('/api/calculation/hp', {
    //     coinList: Object.keys(state.remoxData.coins), //Array.from(new Set(allCoins.filter(s => s))),
    //     lastTxDate: allCumulativeTransactions.at(-1)?.timestamp,
    //     blockchain: blockchain.name,
    //     fiatMoney: currency
    // })

    return [currency];
})

export const UpdatePriceCalculationThunk = createAsyncThunk<"current" | "5" | "10" | "15" | "20" | "30", "current" | "5" | "10" | "15" | "20" | "30">("remoxData/updatePriceCalculation", async (priceCalculation, api) => {
    const type = (api.getState() as RootState).remoxData.accountType
    const userId = (api.getState() as RootState).remoxData.storage?.organization?.id ?? (api.getState() as RootState).remoxData.storage?.individual?.id
    if (!userId) throw new Error('Account is not defined')
    await FirestoreWrite<{
        priceCalculation: "current" | "5" | "10" | "15" | "20" | "30"
    }>().updateDoc(type === "individual" ? "individuals" : "organizations", userId, {
        priceCalculation: priceCalculation,
    })

    return priceCalculation;
})