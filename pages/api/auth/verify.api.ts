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
import { Blockchains } from "types/blockchains";
import { useWalletKit } from "hooks";
import axios from "axios";
import { BASE_URL } from "utils/api";
import { IMultisigOwners } from 'pages/api/multisig/owners.api'
import { toChecksumAddress } from "web3-utils";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {

    try {
        // if (!process.env.EMAIL || !process.env.PASSWORD) throw new Error("Missing env variables");

        // await setPersistence(auth, inMemoryPersistence)
        // await signInWithEmailAndPassword(auth, process.env.EMAIL, process.env.PASSWORD);

        const { signature, publicKey, token, id } = req.query;

        const key = toChecksumAddress(publicKey as string);

        if (!signature || !key) {
            res.status(400).send({
                error: 'Bad request - missing query'
            });
            return;
        }

        const ss = await adminApp.firestore().collection(registeredIndividualCollectionName).doc(key).get()
        const inds = ss.data() as IRegisteredIndividual | undefined;

        if (!inds) throw new Error("Individual not found");

        let password;
        let mail = `${key}Remox@gmail.com`;

        if (inds.blockchain === "celo" || inds.blockchain.includes("evm")) {
            const msgBufferHex = bufferToHex(Buffer.from("Your nonce for signing is " + inds.nonce, 'utf8'));
            const address = recoverPersonalSignature({
                data: msgBufferHex,
                sig: signature as string,
            });


            if (address.toLowerCase() !== key.toLowerCase()) {
                throw new Error("Invalid signature");
            }

            password = inds.password;
        } else if (inds.blockchain === 'solana') {
            const msg = new TextEncoder().encode("Your nonce for signing is " + inds.nonce);
            const sg = new TextEncoder().encode(signature as string);
            const isVerify = nachl.sign.detached.verify(msg, sg, new PublicKey(key).toBuffer())
            if (isVerify) password = inds.password
        }

        if (!password) throw new Error("Invalid password");

        const nonce = Math.round(Math.random() * 10000000);
        await adminApp.firestore().collection(registeredIndividualCollectionName).doc(key).update({
            ...inds,
            nonce
        })


        // This algo is for finding the individual which belongs to this public key and get its real mail and password
        const findWhichIndividual = await adminApp.firestore().collection(individualCollectionName).where("members", "array-contains", key).get()
        if (!findWhichIndividual.empty) {
            const getIndividual = findWhichIndividual.docs[0].data() as IIndividual;

            if (!getIndividual?.notes) {
                await adminApp.firestore().collection(individualCollectionName).doc(getIndividual.id).update({
                    notes: []
                })
                getIndividual["notes"] = [];
            }
    
    

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