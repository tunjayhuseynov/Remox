import { IStorage } from "../redux/slices/account/storage";

export interface PassDataFromSetToPhrase {
    accountAddress: string,
    mnemonic: string,
    ave: IStorage
}