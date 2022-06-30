import { BlockchainType } from "hooks/walletSDK/useWalletKit"
import { IRemoxData } from "../remoxData"

export default {
    setBlockchain: (state: IRemoxData, action: { payload: BlockchainType }) => {
        state.blockchain = action.payload
    },
}