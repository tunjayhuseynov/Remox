import { useFirestoreSearchField } from "rpcHooks/useFirebase";
import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, IUser } from "firebaseConfig";
import { isOldUser } from "hooks/singingProcess/utils";
import { hashing } from "utils/hashing";
import useWalletKit from "./useWalletKit";

export default function useOneClickSign() {
    const { signMessageInWallet, blockchain, Address } = useWalletKit()
    const { search } = useFirestoreSearchField()

    const requestSignFromWallet = async (nonce: number) => {
        return await signMessageInWallet(nonce)
    }

    const processSigning = async (address: string, oldPassword?: string) => {
        const isOld = await isOldUser(address);
        const dbUser = await search<IUser>('users', [{ field: 'address', searching: Address!, indicator: "array-contains" }])

        const reqParams: { publicKey: string, blockchain: string, id?: string, token?: string } = {
            publicKey: Address!,
            blockchain
        };
        if (isOld && dbUser?.[0] && oldPassword) {
            reqParams.id = dbUser[0].id
        }

        const req = await axios.get<string>("/api/auth", {
            params: reqParams
        })

        const nonce = req.data;
        const sign = await requestSignFromWallet(parseInt(nonce))

        let Token;
        let id;

        if (isOld && oldPassword) {
            const password = oldPassword;
            if (dbUser) {
                const token = await hashing((dbUser[0].address[0] ?? Address!), password)
                const encryptedMessageToken = await hashing(password, token)
                Token = encryptedMessageToken;
                id = dbUser[0].id;
            }
        }

        const parameters: { signature: string, publicKey: string, token?: string, id?: string } = {
            signature: sign.signature,
            publicKey: Address!,
        }
        if (Token) parameters.token = Token
        if (id) parameters.id = id

        const verify = await axios.get<{ password: string, mail: string }>("/api/auth/verify", {
            params: parameters,
        })

        const signed = await signInWithEmailAndPassword(auth, verify.data.mail, verify.data.password)
        return signed.user;
    }


    return { processSigning }
}
