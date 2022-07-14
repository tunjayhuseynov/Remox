import { useEffect, useState } from 'react';
import { db, storage } from 'firebaseConfig';
import { onSnapshot, doc, setDoc, getDoc, collection, query, where, getDocs, WhereFilterOp, runTransaction, deleteDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";


export async function FirestoreRead<DataType extends {}>(collection: string, document: string) {
    try {
        const docRef = doc(db, collection, document);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as DataType;
        } else {
            console.error("No such document!");
            return undefined;
        }
    } catch (error: any) {
        console.error("Error getting document:", error);
        throw new Error(error);
    }
}

export function FirestoreWrite<DataType extends {}>() {

    const createDoc = async (collection: string, document: string, data: DataType) => {
        await setDoc(doc(db, collection, document), data);
    }

    const mergeDoc = async (collection: string, document: string, data: DataType) => {
        await setDoc(doc(db, collection, document), data, { merge: true });
    }

    const deleteDocument = async (collection: string, document: string) => {
        await deleteDoc(doc(db, collection, document));
    }

    const updateDoc = async (collection: string, document: string, data: DataType) => {
        try {
            const ref = doc(db, collection, document)
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(ref);
                if (!sfDoc.exists()) {
                    throw "Document does not exist!";
                }
                transaction.update(ref, data);
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
            throw new Error("Transaction failed: " + e);
        }
    }

    return { createDoc, mergeDoc, updateDoc, deleteDocument }
}


export function useFirestoreRead<DataType>(collection: string, document: string) {
    const [data, setData] = useState<DataType>();

    const readDoc = (collection: string, document: string) => {
        return onSnapshot(doc(db, collection, document), (doc) => {
            setData(doc.data() as DataType | undefined)
        });
    }

    useEffect(() => {
        const unsub = readDoc(collection, document);
        return () => unsub();
    }, [document])

    return { data };
}

export function useFirestoreReadMultiple<DataType extends {}>(collectionName: string, queries: { firstQuery: string, condition: WhereFilterOp, secondQuery: any }[]) {
    const [data, setData] = useState<DataType[]>();

    const read = () => {
        const q = query(collection(db, collectionName), ...queries.map(s => where(s.firstQuery, s.condition, s.secondQuery)));
        return onSnapshot(q, (querySnapshot) => {
            const data: DataType[] = [];
            querySnapshot.forEach((doc) => {
                data.push(doc.data() as DataType);
            });
            setData(data);
        });
    }

    useEffect(() => {
        const unsub = read();
        return () => unsub();
    }, [])

    return { data };
}

export async function FirestoreReadMultiple<DataType extends {}>(collectionName: string, queries: { firstQuery: string, condition: WhereFilterOp, secondQuery: any }[]) {
    const q = query(collection(db, collectionName), ...queries.map(s => where(s.firstQuery, s.condition, s.secondQuery)));
    const querySnapshot = await getDocs(q);
    const data: DataType[] = [];
    querySnapshot.forEach((doc) => {
        data.push(doc.data() as DataType);
    });
    return data;
}


export type Indicator = "==" | "in" | "array-contains"
export function useFirestoreSearchField() {
    const [isLoading, setLoading] = useState(false)

    const search = async function<DataType>(collectionName: string, queries: { field: string, searching: string | string[], indicator: Indicator }[]) {
        setLoading(true)
        const ref = collection(db, collectionName);
        const q = query(ref, ...queries.map(s => where(s.field, s.indicator, s.searching)));
        const docSnap = await getDocs(q);
        setLoading(false)
        if (docSnap.docs.length > 0) {
            return docSnap.docs.map(e => e.data()) as DataType[];
        } else {
            console.error("No such user!");
            return undefined;
        }
    }

    return { search, isLoading };
}

export const UploadFile = async (folder: string, image: File) => {
    const reference = ref(storage, `${folder}/${image.name}`);
    await uploadBytes(reference, image);
    return await getDownloadURL(reference)
}
