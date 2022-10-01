import { IAccount, IIndividual, IOrganization } from "firebaseConfig"
import { IRemoxData } from "../remoxData"
import { IStorage } from "../storage"

export default {
    setOrganization: (state: IRemoxData, action: { payload: IOrganization | null }) => {
        if(!action.payload && state.storage){
            state.storage.organization = null;
            state.storage.signType = "individual"
        }
        if (state.storage && action.payload) {
            state.storage.organization = action.payload
            state.storage.signType = "organization"
        }
    },
    setIndividual: (state: IRemoxData, action: { payload: IIndividual }) => {
        if (state.storage) {
            state.storage.individual = action.payload
            state.storage.signType = "individual"
        } else {
            state.storage = {
                individual: action.payload,
                signType: "individual",
                lastSignedProviderAddress: "",
                organization: null,
                uid: "",
            }
        }
    },
    setStorage: (state: IRemoxData, action: { payload: IStorage }) => {
        const data: IStorage = action.payload
        state.storage = data
    },
    removeStorage: (state: IRemoxData) => {
        state.storage = null;
    }
}