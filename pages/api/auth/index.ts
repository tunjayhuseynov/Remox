import { FirestoreRead, FirestoreReadMultiple, FirestoreWrite } from "apiHooks/useFirebase";
import { individualCollectionName } from "crud/individual";
import { registeredIndividualCollectionName } from "crud/registeredIndividual";
import { getAuth, inMemoryPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { auth, IIndividual, IRegisteredIndividual } from "firebaseConfig";
import { NextApiRequest, NextApiResponse } from "next";
import { BlockChainTypes } from "redux/reducers/network";
import { process as Process } from 'uniqid'
import { GetTime } from "utils";
import admin from "firebase-admin";
import serviceAccount from "firebaseConfig/account.json";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (!process.env.EMAIL || !process.env.PASSWORD) throw new Error("Missing env variables");

    await setPersistence(auth, inMemoryPersistence)
    await signInWithEmailAndPassword(auth, process.env.EMAIL, process.env.PASSWORD);

    const { publicKey, blockchain, id } = req.query;

    if (!publicKey || !blockchain) {
        res.status(400).send({
            error: 'Bad request - missing query'
        });
        return;
    }

    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
        databaseURL: "https://remox-dao-default-rtdb.firebaseio.com"
    });

    const inds = await FirestoreRead<IRegisteredIndividual>(registeredIndividualCollectionName, publicKey as string)

    if (!inds) {
        const nonce = Math.round(Math.random() * 10000000);
        const password = Process(publicKey as string);
        let user;
        if (id) {
            user = await app.auth().updateUser(id as string, {
                email: `${publicKey}Remox@gmail.com`,
                password
            })
        } else {
            user = await app.auth().createUser({
                email: `${publicKey}Remox@gmail.com`,
                password
            })
        }

        await FirestoreWrite<IRegisteredIndividual>().createDoc(registeredIndividualCollectionName, publicKey as string, {
            id: user.uid,
            address: publicKey as string,
            nonce,
            blockchain: blockchain as BlockChainTypes,
            password,
            created_date: GetTime()
        })
        return nonce;
    }

    return inds.nonce;

}