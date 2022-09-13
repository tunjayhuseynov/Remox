import { createAsyncThunk } from "@reduxjs/toolkit";
import { Image } from "firebaseConfig";
import { RootState } from "redux/store";
import { FirestoreWrite } from "rpcHooks/useFirebase";
import { changeImage } from "../remoxData";

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