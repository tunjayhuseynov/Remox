import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export type BlockChainTypes = "celo" | "solana" | ""

const initialState: { 
    blockchain: BlockChainTypes,
} = {
    blockchain: (()=>{
        if(typeof window === 'undefined') return ""
        return (localStorage.getItem('blockchain') as (BlockChainTypes | null))
    })() || '',
}

export const networkSlice = createSlice({
    name: 'network',
    initialState,
    reducers: {
        updateBlockchain: (state, action: PayloadAction<BlockChainTypes>) => {
            state.blockchain = action.payload
        },
    },
})

export const { updateBlockchain } = networkSlice.actions

export const selectBlockchain = (state: RootState) => state.network.blockchain


export default networkSlice.reducer