import { createAsyncThunk } from "@reduxjs/toolkit";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { Image, IModerator, IOrganization } from "firebaseConfig";
import { RootState } from "redux/store";
import { FirestoreWrite } from "rpcHooks/useFirebase";
import { AddModerator, RemoveModerator, UpdateModeratorEmail, UpdateModeratorImage, UpdateModeratorName } from "../remoxData";


export const Add_Moderator_Thunk = createAsyncThunk<void, { moderator: IModerator }>("remoxData/add_moderator", async ({ moderator }, api) => {
    const state = (api.getState() as RootState)
    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id
    const type = state.remoxData.accountType;
    if (!id) throw new Error("")

    await FirestoreWrite<any>().updateDoc(type === "organization" ? "organizations" : "individuals", id, {
        moderators: arrayUnion(moderator),
        members: arrayUnion(moderator.address)
    })


    api.dispatch(AddModerator(moderator))
})


export const Remove_Moderator_Thunk = createAsyncThunk<void, { moderatorId: string }>("remoxData/remove_moderator", async ({ moderatorId }, api) => {
    const state = (api.getState() as RootState)
    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id
    const allMods = state.remoxData.storage?.organization?.moderators ?? state.remoxData.storage?.individual.moderators
    const type = state.remoxData.accountType;
    if (!id) throw new Error("No session found")
    if (!allMods) throw new Error("No Moderators")

    const moderator = allMods.find(m => m.id === moderatorId)
    if(!moderator) throw new Error("No Moderator Found")

    await FirestoreWrite<any>().updateDoc(type === "organization" ? "organizations" : "individuals", id, {
        moderators: allMods.filter(s => s.id !== moderatorId),
        members: arrayRemove(moderator.address)
    })


    api.dispatch(RemoveModerator(moderatorId))
})

export const Update_Moderator_Name_Thunk = createAsyncThunk<void, { moderatorId: string, name: string }>("remoxData/update_name_moderator", async ({ moderatorId, name }, api) => {
    const state = (api.getState() as RootState)
    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id
    const allMods = state.remoxData.storage?.organization?.moderators ?? state.remoxData.storage?.individual.moderators
    const type = state.remoxData.accountType;
    if (!id) throw new Error("No session found")
    if (!allMods) throw new Error("No Moderators")

    const currentMod = allMods.find(s => s.id === moderatorId)
    if (!currentMod) throw new Error("No Moderator Found")
    currentMod.name = name

    await FirestoreWrite<Pick<IOrganization, "moderators">>().updateDoc(type === "organization" ? "organizations" : "individuals", id, {
        moderators: [...allMods.filter(s => s.id !== moderatorId), currentMod]
    })


    api.dispatch(UpdateModeratorName({ id: moderatorId, name }))
})

export const Update_Moderator_Email_Thunk = createAsyncThunk<void, { moderatorId: string, mail: string }>("remoxData/update_email_moderator", async ({ moderatorId, mail }, api) => {
    const state = (api.getState() as RootState)
    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id
    const allMods = state.remoxData.storage?.organization?.moderators ?? state.remoxData.storage?.individual.moderators
    const type = state.remoxData.accountType;
    if (!id) throw new Error("No session found")
    if (!allMods) throw new Error("No Moderators")

    const currentMod = allMods.find(s => s.id === moderatorId)
    if (!currentMod) throw new Error("No Moderator Found")
    currentMod.mail = mail

    await FirestoreWrite<Pick<IOrganization, "moderators">>().updateDoc(type === "organization" ? "organizations" : "individuals", id, {
        moderators: [...allMods.filter(s => s.id !== moderatorId), currentMod]
    })


    api.dispatch(UpdateModeratorEmail({ id: moderatorId, email: mail }))
})

export const Update_Moderator_Image_Thunk = createAsyncThunk<void, { moderatorId: string, image: Image }>("remoxData/update_email_moderator", async ({ moderatorId, image }, api) => {
    const state = (api.getState() as RootState)
    const id = state.remoxData.storage?.organization?.id ?? state.remoxData.storage?.individual.id
    const allMods = state.remoxData.storage?.organization?.moderators ?? state.remoxData.storage?.individual.moderators
    const type = state.remoxData.accountType;
    if (!id) throw new Error("No session found")
    if (!allMods) throw new Error("No Moderators")

    const currentMod = allMods.find(s => s.id === moderatorId)
    if (!currentMod) throw new Error("No Moderator Found")
    currentMod.image = image

    await FirestoreWrite<Pick<IOrganization, "moderators">>().updateDoc(type === "organization" ? "organizations" : "individuals", id, {
        moderators: [...allMods.filter(s => s.id !== moderatorId), currentMod]
    })


    api.dispatch(UpdateModeratorImage({ id: moderatorId, image }))
})