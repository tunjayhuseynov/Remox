import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from "firebase/auth";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { auth, IUser } from "firebaseConfig";
import { changeAccount } from "../redux/slices/account/selectedAccount";
import { setStorage } from "../redux/slices/account/storage";
import { decryptMessage, encryptMessage, hashing } from "../utils/hashing";
import { FirestoreRead, FirestoreWrite, useFirestoreSearchField } from "../rpcHooks/useFirebase";
import useTags from "rpcHooks/useTags";
import useWalletKit from "./walletSDK/useWalletKit";


export default function useSignInOrUp() {
    const { Wallet, blockchain } = useWalletKit()
    const { search } = useFirestoreSearchField()
    const [error, setError] = useState<{ errorCode: string, errorMessage: string }>();
    const [user, setUser] = useState<User>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch()
    const { checkTag } = useTags()


    const executeSign = async (address: string, password: string, dataForSignUp?: IUser) => {
        setLoading(true)
        try {
            const dbUser = await search<IUser>('users', [{ field: 'address', searching: address, indicator: "array-contains" }])
            const token = await hashing((dbUser?.[0].address[0] ?? address), password)
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
                    address: [address],
                    multiwallets: [
                        {
                            name: Wallet ?? "",
                            address: address,
                            blockchain: blockchain,
                        }
                    ],
                    companyName: encryptMessage(dataForSignUp.companyName, encryptedMessageToken),
                    name: encryptMessage(dataForSignUp.name, encryptedMessageToken),
                    surname: encryptMessage(dataForSignUp.surname, encryptedMessageToken),
                    seenTime: Math.floor(new Date().getTime() / 1e3),
                    timestamp: Math.floor(new Date().getTime() / 1e3),
                    blockchain: blockchain,
                })
                await FirestoreWrite<{ addresses: { name: string, address: string }[] }>().createDoc('multisigs', user.uid, {
                    addresses: []
                })
                await checkTag()
                // dispatch(setStorage({
                //     accountAddress: address,
                //     allAccounts: [address],
                //     token: token,
                //     uid: user.uid,
                //     companyName: dataForSignUp?.companyName,
                //     surname: dataForSignUp?.surname,
                //     name: dataForSignUp?.name,
                //     encryptedMessageToken: encryptedMessageToken
                // }))
                dispatch(changeAccount(address))
            } else {
                const incomingData = await FirestoreRead<IUser>("users", user!.uid)
                if (!incomingData) {
                    throw new Error("No Data In Users")
                }
                if (!incomingData.multiwallets) {
                    await FirestoreWrite<Pick<IUser, "multiwallets">>().updateDoc("users", user!.uid, {
                        multiwallets: [
                            {
                                name: Wallet ?? "",
                                address: address,
                                blockchain
                            }
                        ]
                    })
                }
                if (!incomingData.blockchain) {
                    await FirestoreWrite<Pick<IUser, "blockchain">>().updateDoc("users", user!.uid, {
                        blockchain
                    })
                }
                if (typeof incomingData.address === "string") {
                    await FirestoreWrite<Pick<IUser, "address">>().updateDoc("users", user!.uid, {
                        address: [
                            incomingData.address
                        ]
                    })
                }
                await checkTag()
                // dispatch(setStorage({
                //     accountAddress: address,
                //     allAccounts: incomingData.address,
                //     token: token,
                //     uid: user!.uid,
                //     contractAddress: incomingData.contractAddress,
                //     companyName: decryptMessage(incomingData?.companyName, encryptedMessageToken),
                //     surname: decryptMessage(incomingData?.surname, encryptedMessageToken),
                //     name: decryptMessage(incomingData?.name, encryptedMessageToken),
                //     encryptedMessageToken: encryptedMessageToken
                // }))
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