import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { BlockchainType } from 'hooks/walletSDK/useWalletKit'
import type { RootState } from '../store'


const initialState: { 
    blockchain: BlockchainType,
} = {
    blockchain: (()=>{
        if(typeof window === 'undefined') return "celo"
        return (localStorage.getItem('blockchain') as (BlockchainType | null))
    })() || 'celo',
}

export const networkSlice = createSlice({
    name: 'network',
    initialState,
    reducers: {
        updateBlockchain: (state, action: PayloadAction<BlockchainType>) => {
            state.blockchain = action.payload
        },
    },
})

export const { updateBlockchain } = networkSlice.actions

export const selectBlockchain = (state: RootState) => state.network.blockchain


export default networkSlice.reducer