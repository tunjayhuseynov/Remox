import { createAsyncThunk } from "@reduxjs/toolkit"
import { arrayRemove, arrayUnion } from "firebase/firestore"
import { ITag, ITxTag } from "pages/api/tags/index.api"
import { FirestoreRead, FirestoreWrite } from "rpcHooks/useFirebase"
import { generate } from "shortid"
import { addTransactionHashToTag, removeTransactionHashFromTag } from "../remoxData"



export const CreateTag = createAsyncThunk<ITag, { id: string, color: string, name: string }>("remoxData/createTag", async ({ id, color, name }) => {
    const res = await FirestoreRead<{ tags: ITag[] }>("tags", id)
    let tag: ITag = {
        id: generate(),
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

export const AddTransactionToTag = createAsyncThunk<{ tagId: string, transactionId: ITxTag }, { id: string, tagId: string, transaction: ITxTag, txIndex?: number }>("remoxData/addTransactionToTag", async ({ id, tagId, transaction, txIndex }, api) => {
    const res = await FirestoreRead<{ tags: ITag[] }>("tags", id)
    const tag = res?.tags.find(t => t.id === tagId)

    if (tag && !tag.transactions.some(t => t.address === transaction.address && t.hash === transaction.hash)) {
        await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
            tags: arrayRemove(tag)
        })
        tag.transactions.push(transaction)
        await FirestoreWrite<{ tags: any }>().updateDoc('tags', id, {
            tags: arrayUnion(tag)
        })
    }

    if (txIndex) {
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