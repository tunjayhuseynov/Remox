import { registeredIndividualCollectionName } from "crud/registeredIndividual";
import { auth, IAccount, IIndividual, IRegisteredIndividual, IUser } from "firebaseConfig";
import { NextApiRequest, NextApiResponse } from "next";
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import nachl from "tweetnacl"
import { PublicKey } from "@solana/web3.js";
import { decryptMessage } from "utils/hashing";
import { Create_Individual, individualCollectionName } from "crud/individual";
import { GetTime } from "utils";
import { IContributor } from "types/dashboard/contributors";
import { adminApp } from "firebaseConfig/admin";
import { Get_Budget_Exercise_Ref } from "crud/budget_exercise";
import { accountCollectionName, Get_Account_Ref } from "crud/account";
import { DocumentReference } from "firebase/firestore";
import { withSentry } from "@sentry/nextjs";
import { Blockchains } from "types/blockchains";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {

    try {
        // if (!process.env.EMAIL || !process.env.PASSWORD) throw new Error("Missing env variables");

        // await setPersistence(auth, inMemoryPersistence)
        // await signInWithEmailAndPassword(auth, process.env.EMAIL, process.env.PASSWORD);

        const { signature, publicKey, token, id } = req.query;

        if (!signature || !publicKey) {
            res.status(400).send({
                error: 'Bad request - missing query'
            });
            return;
        }

        // const inds = await FirestoreRead<IRegisteredIndividual>(registeredIndividualCollectionName, publicKey as string)
        const ss = await adminApp.firestore().collection(registeredIndividualCollectionName).doc(publicKey as string).get()
        const inds = ss.data() as IRegisteredIndividual | undefined;

        if (!inds) throw new Error("Individual not found");

        let password;
        let mail = `${publicKey}Remox@gmail.com`;
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

            // const user = await FirestoreRead<IUser>("users", id as string)
            const ss = await adminApp.firestore().collection("users").doc(id as string).get()
            const user = ss.data() as IUser | undefined;
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

                const contributors = await adminApp.firestore().collection("contributors").where("userId", "==", id as string).get()
                // const contributors = await FirestoreReadMultiple<IuseContributor>("contributors", [
                //     {
                //         condition: "==",
                //         firstQuery: "userId",
                //         secondQuery: id as string,
                //     }
                // ])

                for (const doc of contributors.docs) {
                    const con = doc.data() as IContributor;
                    adminApp.firestore().collection("contributors").doc(con.id).update({
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

                let accounts: IAccount[] = user.address.map(s => ({
                    address: s,
                    createdBy: id as string,
                    blockchain: Blockchains.find(b => b.name === "celo")!,
                    created_date: GetTime(),
                    id: s,
                    image: null,
                    members: [],
                    name: "",
                    provider: null,
                    signerType: "single"
                }))

                const accountRef: DocumentReference[] = [];
                for (const account of accounts) {
                    const res = await adminApp.firestore().collection(accountCollectionName).doc(account.id).set(account);
                    accountRef.push(Get_Account_Ref(account.id));
                }


                let individual: IIndividual = {
                    seenTime,
                    accounts: accountRef,
                    members: [
                        ...user.address
                    ],
                    budget_execrises: [],
                    created_date,
                    id: user.id,
                    image: null,
                    name: (name ?? `Remox User #${Math.round(Math.random() * 1000)}`),
                }
                for (let exercise of individual.budget_execrises) {
                    exercise = Get_Budget_Exercise_Ref(exercise.id);
                }

                await adminApp.firestore().collection(individualCollectionName).doc(individual.id).set(individual);
                await adminApp.firestore().collection("users").doc(id as string).delete();
            }
        }

        const nonce = Math.round(Math.random() * 10000000);
        await adminApp.firestore().collection(registeredIndividualCollectionName).doc(publicKey as string).update({
            ...inds,
            nonce
        })


        // This algo is for finding the individual which belongs to this public key and get its real mail and password
        const findWhichIndividual = await adminApp.firestore().collection(individualCollectionName).where("members", "array-contains", publicKey as string).get()
        if (!findWhichIndividual.empty) {
            const getIndividual = findWhichIndividual.docs[0].data() as IIndividual;
            if (getIndividual.members.length === 0) throw new Error("No member in individual");
            const ss = await adminApp.firestore().collection(registeredIndividualCollectionName).doc(getIndividual.members[0] as string).get()
            mail = `${getIndividual.members[0]}Remox@gmail.com`;
            if (ss.exists) {
                const data = ss.data()
                if (data) {
                    password = data.password
                }
            }

        }

        return res.status(200).send({
            password,
            mail
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).send({
            error: error.message
        });
    }

}

// export default withSentry(handler);
export default handler;