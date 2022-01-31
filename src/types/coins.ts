import { GetBalanceResponseEnum } from './sdk';

export enum CoinsURL {
	CELO = '/icons/celoiconsquare.svg',
	cUSD = '/icons/celodollar.svg',
	cEUR = '/icons/ceur.png',
	UBE = '/icons/ubeswap.png',
	MOO = '/icons/moola.png',
	MOBI = '/icons/mobius.png',
	POOF = '/icons/poof.png',
	cREAL= "/icons/creal.png",
	None = ''
}

export enum CoinsName {
	CELO = 'CELO',
	cUSD = 'cUSD',
	cEUR = 'cEUR',
	UBE = 'UBE',
	MOO = 'MOO',
	MOBI = 'MOBI',
	POOF = 'POOF',
	cREAL= 'cREAL',
}

export enum CoinsNameVisual {
	CELO = 'CELO',
	cUSD = 'cUSD',
	cEUR = 'cEUR',
	UBE = 'UBE',
	MOO = 'MOO',
	MOBI = 'MOBI',
	POOF = 'POOF',
	cREAL= 'cREAL',
}

export enum TransactionFeeTokenName {
	CELO = 'CELO',
	cUSD = 'cUSD',
	cEUR = 'cEUR',
	UBE = 'UBE',
	MOO = 'MOO',
	MOBI = 'MOBI',
	POOF = 'POOF',
	cREAL= 'cREAL',
}

export enum StableTokens {
	cUSD = 'cUSD',
	cEUR = 'cEUR'
}

export enum AltcoinsList {
	UBE = 'UBE',
	MOO = 'MOO',
	MOBI = 'MOBI',
	POOF = 'POOF',
	cREAL= 'cREAL',
}

export enum CoinsNameLower {
	CELO = 'CELO',
	cUSD = 'cUSD',
	cEUR = 'cEUR',
	UBE = 'UBE',
	MOO = 'MOO',
	MOBI = 'MOBI',
	POOF = 'POOF',
	cREAL= 'cREAL',
}

export enum CoinsResponse {}

export const Coins: Coins = {
	CELO: {
		name: CoinsNameVisual.CELO,
		coinUrl: CoinsURL.CELO,
		value: CoinsName.CELO,
		feeName: TransactionFeeTokenName.CELO,
		lowerName: CoinsNameLower.CELO,
		responseName: GetBalanceResponseEnum.CELO,
		contractAddress: "0x471EcE3750Da237f93B8E339c536989b8978a438"
	},
	cUSD: {
		name: CoinsNameVisual.cUSD,
		coinUrl: CoinsURL.cUSD,
		value: CoinsName.cUSD,
		feeName: TransactionFeeTokenName.cUSD,
		lowerName: CoinsNameLower.cUSD,
		responseName: GetBalanceResponseEnum.cUSD,
		contractAddress: "0x765DE816845861e75A25fCA122bb6898B8B1282a"
	},
	cEUR: {
		name: CoinsNameVisual.cEUR,
		coinUrl: CoinsURL.cEUR,
		value: CoinsName.cEUR,
		feeName: TransactionFeeTokenName.cEUR,
		lowerName: CoinsNameLower.cEUR,
		responseName: GetBalanceResponseEnum.cEUR,
		contractAddress: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73"
	},
	UBE: {
		name: CoinsNameVisual.UBE,
		coinUrl: CoinsURL.UBE,
		value: CoinsName.UBE,
		feeName: TransactionFeeTokenName.UBE,
		lowerName: CoinsNameLower.UBE,
		responseName: GetBalanceResponseEnum.UBE, 
		contractAddress: "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC"
	},
	MOO: {
		name: CoinsNameVisual.MOO,
		coinUrl: CoinsURL.MOO,
		value: CoinsName.MOO,
		feeName: TransactionFeeTokenName.MOO,
		lowerName: CoinsNameLower.MOO,
		responseName: GetBalanceResponseEnum.MOO, 
		contractAddress: "0x17700282592D6917F6A73D0bF8AcCf4D578c131e"
	},
	MOBI: {
		name: CoinsNameVisual.MOBI,
		coinUrl: CoinsURL.MOBI,
		value: CoinsName.MOBI,
		feeName: TransactionFeeTokenName.MOBI,
		lowerName: CoinsNameLower.MOBI,
		responseName: GetBalanceResponseEnum.MOBI, 
		contractAddress: "0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B"
	},
	POOF: {
		name: CoinsNameVisual.POOF,
		coinUrl: CoinsURL.POOF,
		value: CoinsName.POOF,
		feeName: TransactionFeeTokenName.POOF,
		lowerName: CoinsNameLower.POOF,
		responseName: GetBalanceResponseEnum.POOF, 
		contractAddress: "0x00400FcbF0816bebB94654259de7273f4A05c762"
	},
	cREAL: {	
		name: CoinsNameVisual.cREAL,
		coinUrl: CoinsURL.cREAL,
		value: CoinsName.cREAL,
		feeName: TransactionFeeTokenName.cREAL,
		lowerName: CoinsNameLower.cREAL,
		responseName: GetBalanceResponseEnum.cREAL, 
		contractAddress: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787"
	}
};

export interface Coins {
	CELO: AltCoins;
	cUSD: AltCoins;
	cEUR: AltCoins;
	UBE: AltCoins;
	MOO: AltCoins;
	MOBI: AltCoins;
	POOF: AltCoins;
	cREAL: AltCoins;
}

export interface AltCoins {
	name: CoinsNameVisual;
	coinUrl: CoinsURL;
	value: CoinsName;
	feeName: TransactionFeeTokenName;
	lowerName: CoinsNameLower;
	responseName: GetBalanceResponseEnum;
	contractAddress: string;
}
