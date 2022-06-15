import { CoinsURL } from "./coins";

export type DropDownItem = DropDownExtra;


interface BaseDropDown {
    name: string,
    feeName?: string,
    className?: string, 
    photo?:string,
    id?: string,
    onClick?: () => void,
}

interface DropDownExtra extends BaseDropDown{
    type?: string,
    amount?: string,
    address?: string,
    coinUrl?: CoinsURL
}

