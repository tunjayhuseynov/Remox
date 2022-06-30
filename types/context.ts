import React from 'react'
import { IStorage } from '../redux/slices/account/storage'

export interface CustomContext{
    data : IStorage | undefined, 
    setData : React.Dispatch<IStorage> | undefined, 
    setUnlock : React.Dispatch<boolean> | undefined, 
    unlock : boolean 
}
