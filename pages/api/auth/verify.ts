import { FirestoreRead, FirestoreReadMultiple, FirestoreWrite } from "apiHooks/useFirebase";
import { registeredIndividualCollectionName } from "crud/registeredIndividual";
import { auth, IIndividual, IRegisteredIndividual, IUser } from "firebaseConfig";
import { NextApiRequest, NextApiResponse } from "next";
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import { inMemoryPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import nachl from "tweetnacl"
import { PublicKey } from "@solana/web3.js";
import admin from "firebase-admin";
import serviceAccount from "firebaseConfig/account.json";
import { decryptMessage } from "utils/hashing";
import { Create_Individual, individualCollectionName } from "crud/individual";
import { GetTime } from "utils";
import { IuseContributor } from "apiHooks/useContributors";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {

    if (!process.env.EMAIL || !process.env.PASSWORD) throw new Error("Missing env variables");

    await setPersistence(auth, inMemoryPersistence)
    await signInWithEmailAndPassword(auth, process.env.EMAIL, process.env.PASSWORD);

    const { signature, publicKey, token, id } = req.query;

    if (!signature || !publicKey) {
        res.status(400).send({
            error: 'Bad request - missing query'
        });
        return;
    }


    const inds = await FirestoreRead<IRegisteredIndividual>(registeredIndividualCollectionName, publicKey as string)
    if (!inds) throw new Error("Individual not found");

    let password;
    if (inds.blockchain === "celo") {
        const msgBufferHex = bufferToHex(Buffer.from("Your nonce for signing is " + inds.nonce, 'utf8'));
        const address = recoverPersonalSignature({
            data: msgBufferHex,
            sig: signature as string,
        });

        if (address.toLowerCase() !== (publicKey as string).toLowerCase()) {
            throw new Error("Invalid signature");
        }

        password = inds.password;
    } else if (inds.blockchain === 'solana') {
        const msg = new TextEncoder().encode("Your nonce for signing is " + inds.nonce);
        const sg = new TextEncoder().encode(signature as string);
        const isVerify = nachl.sign.detached.verify(msg, sg, new PublicKey(publicKey as string).toBuffer())
        if (isVerify) password = inds.password
    }

    if (!password) throw new Error("Invalid signature");

    if (token && id) {
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as any),
            databaseURL: "https://remox-dao-default-rtdb.firebaseio.com"
        });

        const user = await FirestoreRead<IUser>("users", id as string)
        if (user) {
            let name, surname, company, seenTime, created_date;
            if (user.name) {
                name = decryptMessage(user.name, token as string);
            }
            if (user.surname) {
                surname = decryptMessage(user.surname, token as string);
            }
            if (user.companyName) {
                company = decryptMessage(user.companyName, token as string);
            }
            seenTime = user.seenTime;
            created_date = user.timestamp;

            const contributors = await FirestoreReadMultiple<IuseContributor>("contributors", [
                {
                    condition: "==",
                    firstQuery: "userId",
                    secondQuery: id as string,
                }
            ])

            for (const con of contributors) {
                app.firestore().collection("contributors").doc(con.id).update({
                    ...con,
                    members: con.members.map(m => ({
                        ...m,
                        address: decryptMessage(m.address, token as string),
                        amount: decryptMessage(m.amount, token as string),
                        name: decryptMessage(m.name, token as string),
                        secondaryAmount: m.secondaryAmount ? decryptMessage(m.secondaryAmount, token as string) : null,
                    }))
                });
            }

            await Create_Individual({
                seenTime,
                accounts: user.address.map(s => ({
                    address: s,
                    blockchain: "celo",
                    created_date: GetTime(),
                    id: s,
                    image: null,
                    members: [],
                    name: "",
                    provider: null,
                    signerType: "single"
                })),
                addresses: [
                    ...user.address
                ],
                budget_execrises: [],
                created_date,
                id: user.id,
                image: null,
                name: (name ?? `Remox User #${Math.round(Math.random() * 1000)}`)
            })
        }
    }

    const nonce = Math.round(Math.random() * 10000000);
    await FirestoreWrite<IRegisteredIndividual>().updateDoc(registeredIndividualCollectionName, publicKey as string, {
        ...inds,
        nonce
    })
    return password;

}