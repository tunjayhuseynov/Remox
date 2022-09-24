import { IAccount, Image } from "firebaseConfig";
import { IRemoxData } from "../remoxData";

interface IPropsImage { account: IAccount, image: Image, memberId: string }
export default {
    Update_Account_Member_Image: (state: IRemoxData, action: { payload: IPropsImage }) => {
        const { account, image, memberId } = action.payload

        const accountIndex = state.accounts.findIndex(s => s.id === account.id)
        if (accountIndex === -1) throw new Error("No Account Found")
        const memberIndex = state.accounts[accountIndex].members.findIndex(s => s.id === memberId)
        if (memberIndex === -1) throw new Error("No Member Found")
        state.accounts[accountIndex].members[memberIndex].image = image
    },

    Update_Account_Member_Name: (state: IRemoxData, action: { payload: { account: IAccount, name: string, memberId: string } }) => {
        const { account, name, memberId } = action.payload

        const accountIndex = state.accounts.findIndex(s => s.id === account.id)
        if (accountIndex === -1) throw new Error("No Account Found")
        const memberIndex = state.accounts[accountIndex].members.findIndex(s => s.id === memberId)
        if (memberIndex === -1) throw new Error("No Member Found")
        state.accounts[accountIndex].members[memberIndex].name = name
    },

    Update_Account_Member_Email: (state: IRemoxData, action: { payload: { account: IAccount, email: string, memberId: string } }) => {
        const { account, email, memberId } = action.payload

        const accountIndex = state.accounts.findIndex(s => s.id === account.id)
        if (accountIndex === -1) throw new Error("No Account Found")
        const memberIndex = state.accounts[accountIndex].members.findIndex(s => s.id === memberId)
        if (memberIndex === -1) throw new Error("No Member Found")
        state.accounts[accountIndex].members[memberIndex].mail = email
    }
}