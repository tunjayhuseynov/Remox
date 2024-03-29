import { CoinsURL } from "./coins";

export type DropDownItem = DropDownExtra;


interface BaseDropDown {
    name: string,
    feeName?: string,
    className?: string, 
    photo?:string,
    totalValue?:string,
    id?: string | number,
    onClick?: () => void,
}

interface DropDownExtra extends BaseDropDown{
    type?: string,
    amount?: string,
    address?: string,
    coinUrl?: CoinsURL
}

