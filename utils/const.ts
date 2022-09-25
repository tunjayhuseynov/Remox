import chroma from "chroma-js";
import { FiatMoneyList } from "firebaseConfig";
import { IHpApiResponse } from "pages/api/calculation/hp.api";
import { StylesConfig } from "react-select";
import { AltCoins } from "types";
import { IPrice } from "./api";

const env = process.env.NODE_ENV

export const BaseUrl = env == "development" ? "http://localhost:3000" : "https://app.remox.io";

//Remox Pay
export type SelectType = { value: string, label: string, color: string, transactions: string[], isDefault: boolean }

// Remox Pay
export const colourStyles = (dark: boolean) => ({
    control: (styles: any) => ({ ...styles, boxShadow: 'none', border: "1px solid #1C1C1C", "&:hover": { border: "1px solid #1C1C1C", }, backgroundColor: dark ? "text-dark" : 'white', height: "100%" }),
    option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
        const color = chroma(data.color);
        return {
            ...styles,
            outline: 'none',
            border: 'none',
            backgroundColor: isDisabled
                ? undefined
                : isSelected
                    ? data.color
                    : isFocused
                        ? color.alpha(0.1).css()
                        : undefined,
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? chroma.contrast(color, 'white') > 2
                        ? 'white'
                        : 'black'
                    : data.color,
            cursor: isDisabled ? 'not-allowed' : 'default',

            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled
                    ? isSelected
                        ? data.color
                        : color.alpha(0.3).css()
                    : undefined,
            },
        };
    },
    multiValue: (styles: any, { data }: any) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: color.alpha(0).css(),
        };
    },
    multiValueLabel: (styles: any, { data }: any) => ({
        ...styles,
        color: data.color,
        ...dot(data.color)
    }),
    multiValueRemove: (styles: any, { data }: any) => {

        return {
            ...styles,
            color: data.color,
            ':hover': {
                backgroundColor: data.color,
                color: 'white',
            },
        }
    },
});

// Remox Pay
export const dot = (color = 'transparent') => ({
    alignItems: 'center',
    display: 'flex',

    ':before': {
        backgroundColor: color,
        borderRadius: 10,
        content: '" "',
        display: 'block',
        marginRight: 8,
        height: 10,
        width: 10,
    },
});


export const GetFiatPrice = (coin: AltCoins, fiat: FiatMoneyList) => {
    switch (fiat) {
        case "CAD":
            return coin.priceCAD;
        case "EUR":
            return coin.priceEUR;
        case "GBP":
            return coin.priceGBP;
        case "JPY":
            return coin.priceJPY;
        case "TRY":
            return coin.priceTRY;
        case "AUD":
            return coin.priceAUD;
        case "USD":
            return coin.priceUSD;
        default:
            return coin.priceUSD
    }
}

export const generatePriceCalculation = (coin: IPrice[0], hp: IHpApiResponse, pc: string, fiat: FiatMoneyList) => {
    switch (pc) {
        case "current":
            return coin.amount * GetFiatPrice(coin, fiat);
        case "5":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-5).reduce((a, b) => a + b.price, 0) / 5) ?? GetFiatPrice(coin, fiat);
        case "10":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-10).reduce((a, b) => a + b.price, 0) / 10) ?? GetFiatPrice(coin, fiat);
        case "15":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-15).reduce((a, b) => a + b.price, 0) / 15) ?? GetFiatPrice(coin, fiat);
        case "20":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-20).reduce((a, b) => a + b.price, 0) / 20) ?? GetFiatPrice(coin, fiat);
        case "30":
            return coin.amount * (hp[coin.symbol]?.[fiat].slice(-30).reduce((a, b) => a + b.price, 0) / 30) ?? GetFiatPrice(coin, fiat);
        default:
            return coin.amount * GetFiatPrice(coin, fiat);
    }
}