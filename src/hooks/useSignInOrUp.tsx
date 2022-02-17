import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from "firebase/auth";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { auth, IUser } from "../firebase";
import { changeAccount } from "../redux/reducers/selectedAccount";
import { setStorage } from "../redux/reducers/storage";
import { decryptMessage, encryptMessage, hashing } from "../utils/hashing";
import { FirestoreRead, FirestoreWrite } from "../API/useFirebase";
import { useContractKit } from "@celo-tools/use-contractkit";
import { toTransactionObject } from "@celo/connect";
import { toWei } from "web3-utils";


export default function useSignInOrUp() {
    const { kit } = useContractKit()
    const [error, setError] = useState<{ errorCode: string, errorMessage: string }>();
    const [user, setUser] = useState<User>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch()


    const executeSign = async (address: string, password: string, dataForSignUp?: IUser) => {
        setLoading(true)
        try {
            const token = await hashing(address, password)
            const encryptedMessageToken = await hashing(password, token)
            let userCredential;
            if (!dataForSignUp) {
                userCredential = await signInWithEmailAndPassword(auth, token + "@gmail.com", password)
            }

            let user = userCredential?.user;

            if (dataForSignUp) {

                userCredential = await createUserWithEmailAndPassword(auth, token + "@gmail.com", password)
                let user = userCredential.user;

                await FirestoreWrite<IUser>().createDoc('users', user.uid, {
                    id: user.uid,
                    address: address,
                    companyName: encryptMessage(dataForSignUp.companyName, encryptedMessageToken),
                    name: encryptMessage(dataForSignUp.name, encryptedMessageToken),
                    surname: encryptMessage(dataForSignUp.surname, encryptedMessageToken),
                    seenTime: new Date().getTime(),
                    timestamp: new Date().getTime()
                })
                await FirestoreWrite<{ addresses: { name: string, address: string }[] }>().createDoc('multisigs', user.uid, {
                    addresses: []
                })
                dispatch(setStorage({
                    accountAddress: address,
                    token: token,
                    uid: user.uid,
                    companyName: dataForSignUp?.companyName,
                    surname: dataForSignUp?.surname,
                    name: dataForSignUp?.name,
                    encryptedMessageToken: encryptedMessageToken
                }))
                dispatch(changeAccount(address))
            } else {
                const incomingData = await FirestoreRead<IUser>("users", user!.uid)
                if (!incomingData) {
                    throw new Error("No Data In Users")
                }
                dispatch(setStorage({
                    accountAddress: address,
                    token: token,
                    uid: user!.uid,
                    contractAddress: incomingData.contractAddress,
                    companyName: decryptMessage(incomingData?.companyName, encryptedMessageToken),
                    surname: decryptMessage(incomingData?.surname, encryptedMessageToken),
                    name: decryptMessage(incomingData?.name, encryptedMessageToken),
                    encryptedMessageToken: encryptedMessageToken
                }))
                dispatch(changeAccount(address))
            }

            setUser(user)
            setLoading(false)
            return user
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            setError({ errorCode, errorMessage })
            setLoading(false)
            throw new Error(errorMessage)
        }
    }

    return { user, error, executeSign, isLoading };
}