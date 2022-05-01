import { IStorage } from "../redux/reducers/storage";

export interface PassDataFromSetToPhrase {
    accountAddress: string,
    mnemonic: string,
    localSave: IStorage
}