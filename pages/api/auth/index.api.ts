import { registeredIndividualCollectionName } from "crud/registeredIndividual";
import { IRegisteredIndividual } from "firebaseConfig";
import { NextApiRequest, NextApiResponse } from "next";
import { process as Process } from 'uniqid'
import { GetTime } from "utils";
import { adminApp } from 'firebaseConfig/admin';
import { BlockchainType } from "types/blockchains";
import { toChecksumAddress } from "web3-utils";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        // if (!process.env.EMAIL || !process.env.PASSWORD) throw new Error("Missing env variables");

        // await setPersistence(auth, inMemoryPersistence)
        // await signInWithEmailAndPassword(auth, process.env.EMAIL, process.env.PASSWORD);

        const { publicKey, blockchain, id } = req.query;

        if (!publicKey || !blockchain) {
            res.status(400).send({
                error: 'Bad request - missing query'
            });
            return;
        }



        // const inds = await FirestoreRead<IRegisteredIndividual>(registeredIndividualCollectionName, publicKey as string)
        const key = publicKey as string;
        const ss = await adminApp.firestore().collection(registeredIndividualCollectionName).doc(key.startsWith("0x") ? toChecksumAddress(key) : key).get()
        const inds = ss.data() as IRegisteredIndividual | undefined;

        if (!inds) {
            const nonce = Math.round(Math.random() * 10000000);
            const password = Process(publicKey as string);
            let user;

            if (id) {
                user = await adminApp.auth().updateUser(id as string, {
                    email: `${publicKey}Remox@gmail.com`,
                    password
                })
            } else {
                user = await adminApp.auth().createUser({
                    email: `${publicKey}Remox@gmail.com`,
                    password
                })
            }

            await adminApp.firestore().collection(registeredIndividualCollectionName).doc(key.startsWith("0x") ? toChecksumAddress(key) : key).set({
                id: user.uid,
                address: publicKey as string,
                nonce,
                blockchain: blockchain as BlockchainType["name"],
                password,
                created_date: GetTime()

            })

            // await FirestoreWrite<IRegisteredIndividual>().createDoc(registeredIndividualCollectionName, publicKey as string, {
            //     id: user.uid,
            //     address: publicKey as string,
            //     nonce,
            //     blockchain: blockchain as BlockChainTypes,
            //     password,
            //     created_date: GetTime()
            // })
            return res.status(200).send(nonce);
        }

        return res.status(200).send(inds.nonce);
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }

}