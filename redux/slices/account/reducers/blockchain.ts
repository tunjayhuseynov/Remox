import { BlockchainType } from "types/blockchains"
import { IRemoxData } from "../remoxData"

export default {
    setBlockchain: (state: IRemoxData, action: { payload: BlockchainType }) => {
        state.blockchain = action.payload
    },
}