import { FirestoreWrite, FirestoreRead, useFirestoreRead } from 'rpcHooks/useFirebase'
import { useState } from 'react'
import { auth } from 'firebaseConfig';
import { generate } from 'shortid'
import { arrayUnion, arrayRemove } from 'firebase/firestore'
import { useSelector } from 'react-redux';
import { addTag, removeTag, SelectParsedTransactions } from 'redux/slices/account/transactions';
import { useDispatch } from 'react-redux';

export interface Tag {
    id: string;
    name: string;
    color: string;
    transactions: string[],
    isDefault: boolean;
}

export function useListenTags() {
    const { data } = useFirestoreRead<{ tags: Tag[] }>("tags", auth.currentUser?.uid ?? "0");

    return data;
}

export default function useTags() {
    // const txs = useSelector(SelectParsedTransactions)
    const dispatch = useDispatch()
    const [isLoading, setLoading] = useState(false)

    const checkTag = async () => {
        try {
            const res = await FirestoreRead<{ tags: Tag[] }>("tags", auth.currentUser!.uid)

            if (!res) {
                await FirestoreWrite<{ tags: Tag[] }>().createDoc('tags', auth.currentUser!.uid, {
                    tags: [
                        {
                            id: "Payroll",
                            color: "#00f9e0",
                            name: "Payroll",
                            transactions: [],
                            isDefault: true
                        },
                        {
                            id: "Reimbursement",
                            color: "#6851ff",
                            name: "Reimbursement",
                            transactions: [],
                            isDefault: true
                        },
                    ]
                })
            }
        } catch (error) {

        }
    }

    const createTag = async (name: string, color: string) => {
        setLoading(true)
        try {
            const res = await FirestoreRead<{ tags: Tag[] }>("tags", auth.currentUser!.uid)

            if (!res) {
                await FirestoreWrite<{ tags: Tag[] }>().createDoc('tags', auth.currentUser!.uid, {
                    tags: [
                        {
                            id: generate(),
                            color: color,
                            name: name,
                            transactions: [],
                            isDefault: false
                        }
                    ]
                })
            } else {
                await FirestoreWrite<{ tags: any }>().updateDoc('tags', auth.currentUser!.uid, {
                    tags: arrayUnion({
                        id: generate(),
                        color: color,
                        name: name,
                        transactions: [],
                        isDefault: false
                    })
                })
            }
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    const updateTag = async (oldTag: Tag, newTag: Tag) => {
        setLoading(true)
        try {
            await FirestoreWrite<{ tags: any }>().updateDoc('tags', auth.currentUser!.uid, {
                tags: arrayRemove(oldTag)
            })
            await FirestoreWrite<{ tags: any }>().updateDoc('tags', auth.currentUser!.uid, {
                tags: arrayUnion(newTag)
            })
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    const deleteTag = async (tag: Tag) => {
        setLoading(true)
        try {
            await FirestoreWrite<{ tags: any }>().updateDoc('tags', auth.currentUser!.uid, {
                tags: arrayRemove(tag)
            })
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    const addTransaction = async (id: string, transactionId: string) => {
        setLoading(true)
        try {
            const res = await FirestoreRead<{ tags: Tag[] }>("tags", auth.currentUser!.uid)
            const tag = res?.tags.find(t => t.id === id)

            if (tag && !tag.transactions.includes(transactionId)) {
                await FirestoreWrite<{ tags: any }>().updateDoc('tags', auth.currentUser!.uid, {
                    tags: arrayRemove(tag)
                })
                tag.transactions.push(transactionId)
                await FirestoreWrite<{ tags: any }>().updateDoc('tags', auth.currentUser!.uid, {
                    tags: arrayUnion(tag)
                })
            }
            if (tag) {
                dispatch(addTag({ transactionId, tag }))
            }
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }

    const removeTransactions = async (id: string, transactionId: string) => {
        setLoading(true)
        try {
            const res = await FirestoreRead<{ tags: Tag[] }>("tags", auth.currentUser!.uid)
            const tag = res?.tags.find(t => t.id === id)

            if (tag) {
                await FirestoreWrite<{ tags: any }>().updateDoc('tags', auth.currentUser!.uid, {
                    tags: arrayRemove(tag)
                })
                tag.transactions = tag.transactions.filter(t => t !== transactionId)
                await FirestoreWrite<{ tags: any }>().updateDoc('tags', auth.currentUser!.uid, {
                    tags: arrayUnion(tag)
                })
            }
            if (tag) {
                dispatch(removeTag({ transactionId, tag }))
            }
            setLoading(false)
        } catch (error: any) {
            console.error(error)
            setLoading(false)
            throw new Error(error.message)
        }
    }


    return { createTag, updateTag, deleteTag, addTransaction, removeTransactions, checkTag, isLoading };
}
