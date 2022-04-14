import { useEffect, useState } from 'react';
import { db } from 'firebase';
import { onSnapshot, doc, setDoc, getDoc, collection, query, where, getDocs, WhereFilterOp, runTransaction, deleteDoc } from 'firebase/firestore';


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
            throw new Error("Transaction failed: " + e)
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

export function useFirestoreReadMultiple<DataType extends {}>(collectionName: string, queries: {firstQuery: string, condition: WhereFilterOp, secondQuery: any}[]) {
    const [data, setData] = useState<DataType[]>();

    const read = () => {
        const q = query(collection(db, collectionName), ...queries.map(s=>where(s.firstQuery, s.condition, s.secondQuery)));
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



export function useFirestoreSearchField<DataType extends {}>() {
    const [isLoading, setLoading] = useState(false)

    const search = async (collectionName: string, field: string, searching: string | string[], indicator: "==" | "in" | "array-contains") => {
        setLoading(true)
        const ref = collection(db, collectionName);
        const q = query(ref, where(field, indicator, searching));
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


