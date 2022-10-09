import { createAsyncThunk, nanoid } from "@reduxjs/toolkit"
import { arrayRemove, arrayUnion } from "firebase/firestore"
import { ITag, ITxTag } from "pages/api/tags/index.api"
import { RootState } from "redux/store"
import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase"
import { generate } from "shortid"
import { addTransactionHashToTag, removeTransactionHashFromTag } from "../remoxData"



export const CreateTag = createAsyncThunk<ITag, { id: string, color: string, name: string }>("remoxData/createTag", async ({ id, color, name }) => {
    const res = await FirestoreRead<{ tags: ITag[] }>("tags", id)
    let tag: ITag = {
        id: nanoid(),
        color: color,
        name: name,
        transactions: [],
        isDefault: false
    }

    if (!res) {
        await FirestoreWrite<{ tags: ITag[] }>().createDoc('tags', id, {
            tags: [tag]
        })
    } else {
        await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
            tags: arrayUnion(tag)
        })
    }

    return tag;
})

export const UpdateTag = createAsyncThunk<{ newTag: ITag, oldTag: ITag }, { id: string, oldTag: ITag, newTag: ITag }>("remoxData/updateTag", async ({ id, oldTag, newTag }) => {
    await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
        tags: arrayRemove(oldTag)
    })
    await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
        tags: arrayUnion(newTag)
    })

    return { newTag, oldTag };
})

export const DeleteTag = createAsyncThunk<ITag, { id: string, tag: ITag }>("remoxData/deleteTag", async ({ id, tag }) => {
    await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
        tags: arrayRemove(tag)
    })

    return tag;
})

export const AddTransactionToTag = createAsyncThunk<{ tagId: string, transactionId: ITxTag }, { tagId: string, transaction: ITxTag, txIndex?: number }>("remoxData/addTransactionToTag", async ({ tagId, transaction, txIndex }, api) => {
    const id = (api.getState() as RootState).remoxData.storage?.organization?.id ?? (api.getState() as RootState).remoxData.storage?.individual?.id
    if (!id) throw new Error("No id found")
    const res = await FirestoreRead<{ tags: ITag[] }>("tags", id)
    const tag = res?.tags.find(t => t.id === tagId)

    if (tag && !tag.transactions.find(t => t.address.toLowerCase() === transaction.address.toLowerCase() && t.hash.toLowerCase() === transaction.hash.toLowerCase())) {
        await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
            tags: arrayRemove(tag)
        })
        tag.transactions.push(transaction)
        await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
            tags: arrayUnion(tag)
        })
    }

    if (txIndex !== undefined) {
        api.dispatch(addTransactionHashToTag({
            tagId,
            transactionTag: transaction,
            txIndex: txIndex
        }))
    }


    return { tagId, transactionId: transaction };
})

export const RemoveTransactionFromTag = createAsyncThunk<{ tagId: string, transactionId: ITxTag }, { id: string, tagId: string, transactionId: ITxTag, txIndex: number }>("remoxData/removeTransactionFromTag", async ({ id, tagId, transactionId, txIndex }, api) => {
    const res = await FirestoreRead<{ tags: ITag[] }>("tags", id)
    const tag = res?.tags.find(t => t.id === tagId)

    if (tag) {
        await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
            tags: arrayRemove(tag)
        })
        tag.transactions = tag.transactions.filter(t => t.id !== transactionId.id)
        await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
            tags: arrayUnion(tag)
        })
    }

    api.dispatch(removeTransactionHashFromTag({
        tagId,
        transactionId,
        txIndex
    }))

    return { transactionId, tagId };
})