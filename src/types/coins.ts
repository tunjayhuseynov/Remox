export enum CoinsURL {
	CELO = '/icons/celoiconsquare.svg',
	cUSD = '/icons/celodollar.svg',
	cEUR = '/icons/ceur.png',
	UBE = '/icons/ubeswap.png',
	MOO = '/icons/moola.png',
	MOBI = '/icons/mobius.png',
	POOF = '/icons/poof.png',
	cREAL = '/icons/creal.png',
	PACT = '/icons/pact.png',
	ARI = '/icons/ari.png',
	None = ''
}

export enum CoinsName {
	CELO = 'CELO',
	cUSD = 'cUSD',
	cEUR = 'cEUR',
	cREAL = 'cREAL',
	UBE = 'UBE',
	MOO = 'MOO',
	MOBI = 'MOBI',
	POOF = 'POOF',
	PACT = 'PACT',
	ARI = 'ARI'
}

export enum PoofCoinsName {
	CELO_V2 = 'CELO_v2',
	cUSD_V2 = 'cUSD_v2',
	cEUR_V2 = 'cEUR_v2',
	cREAL_V2 = 'cREAL_v2',
	CELO_V1 = 'CELO_v1',
	cUSD_V1 = 'cUSD_v1',
	cEUR_V1 = 'cEUR_v1',
	cREAL_V1 = 'cREAL_v1'
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
	cREAL = 'cREAL'
}

export enum CoinsNameLower {
	CELO = 'CELO',
	cUSD = 'cUSD',
	cEUR = 'cEUR',
	UBE = 'UBE',
	MOO = 'MOO',
	MOBI = 'MOBI',
	POOF = 'POOF',
	cREAL = 'cREAL',
	PACT = 'PACT',
	ARI = 'ARI'
}

export enum CoinsResponse {}

export enum TokenType {
	GoldToken = 'GoldToken',
	StableToken = 'StableToken',
	Altcoin = 'Altcoin'
}

export const PoofCoins: PoofCoins = {
	CELO_v2: {
		name: PoofCoinsName.CELO_V2,
		coinUrl: CoinsURL.CELO,
		value: PoofCoinsName.CELO_V2,
		lowerName: CoinsNameLower.CELO,
		type: TokenType.GoldToken,
		contractAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438'
	},
	cUSD_v2: {
		name: PoofCoinsName.cUSD_V2,
		coinUrl: CoinsURL.cUSD,
		value: PoofCoinsName.cUSD_V2,
		lowerName: CoinsNameLower.cUSD,
		type: TokenType.StableToken,
		contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a'
	},
	cEUR_v2: {
		name: PoofCoinsName.cEUR_V2,
		coinUrl: CoinsURL.cEUR,
		value: PoofCoinsName.cEUR_V2,
		lowerName: CoinsNameLower.cEUR,
		type: TokenType.StableToken,
		contractAddress: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'
	},
	cREAL_v2: {
		name: PoofCoinsName.cREAL_V2,
		coinUrl: CoinsURL.cREAL,
		value: PoofCoinsName.cREAL_V2,
		lowerName: CoinsNameLower.cREAL,
		type: TokenType.StableToken,
		contractAddress: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787'
	},
	CELO_v1: {
		name: PoofCoinsName.CELO_V1,
		coinUrl: CoinsURL.CELO,
		value: PoofCoinsName.CELO_V1,
		lowerName: CoinsNameLower.CELO,
		type: TokenType.GoldToken,
		contractAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438'
	},
	cUSD_v1: {
		name: PoofCoinsName.cUSD_V1,
		coinUrl: CoinsURL.cUSD,
		value: PoofCoinsName.cUSD_V1,
		lowerName: CoinsNameLower.cUSD,
		type: TokenType.StableToken,
		contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a'
	},
	cEUR_v1: {
		name: PoofCoinsName.cEUR_V1,
		coinUrl: CoinsURL.cEUR,
		value: PoofCoinsName.cEUR_V1,
		lowerName: CoinsNameLower.cEUR,
		type: TokenType.StableToken,
		contractAddress: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'
	},
	cREAL_v1: {
		name: PoofCoinsName.cREAL_V1,
		coinUrl: CoinsURL.cREAL,
		value: PoofCoinsName.cREAL_V1,
		lowerName: CoinsNameLower.cREAL,
		type: TokenType.StableToken,
		contractAddress: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787'
	}
};

export const Coins: Coins = {
	CELO: {
		name: CoinsName.CELO,
		coinUrl: CoinsURL.CELO,
		value: CoinsName.CELO,
		lowerName: CoinsNameLower.CELO,
		type: TokenType.GoldToken,
		contractAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438',
		color: "#fbce5c"
	},
	cUSD: {
		name: CoinsName.cUSD,
		coinUrl: CoinsURL.cUSD,
		value: CoinsName.cUSD,
		lowerName: CoinsNameLower.cUSD,
		type: TokenType.StableToken,
		contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
		color: "#46cd85"
	},
	cEUR: {
		name: CoinsName.cEUR,
		coinUrl: CoinsURL.cEUR,
		value: CoinsName.cEUR,
		lowerName: CoinsNameLower.cEUR,
		type: TokenType.StableToken,
		contractAddress: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
		color: "#040404"
	},
	cREAL: {
		name: CoinsName.cREAL,
		coinUrl: CoinsURL.cREAL,
		value: CoinsName.cREAL,
		lowerName: CoinsNameLower.cREAL,
		type: TokenType.StableToken,
		contractAddress: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
		color: "#e904a3"
	},
	UBE: {
		name: CoinsName.UBE,
		coinUrl: CoinsURL.UBE,
		value: CoinsName.UBE,
		lowerName: CoinsNameLower.UBE,
		type: TokenType.Altcoin,
		contractAddress: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
		color: "#6D619A"
	},
	MOO: {
		name: CoinsName.MOO,
		coinUrl: CoinsURL.MOO,
		value: CoinsName.MOO,
		lowerName: CoinsNameLower.MOO,
		type: TokenType.Altcoin,
		contractAddress: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
		color: '#3288ec'
	},
	MOBI: {
		name: CoinsName.MOBI,
		coinUrl: CoinsURL.MOBI,
		value: CoinsName.MOBI,
		lowerName: CoinsNameLower.MOBI,
		type: TokenType.Altcoin,
		contractAddress: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
		color: '#e984a0'
	},
	POOF: {
		name: CoinsName.POOF,
		coinUrl: CoinsURL.POOF,
		value: CoinsName.POOF,
		lowerName: CoinsNameLower.POOF,
		type: TokenType.Altcoin,
		contractAddress: '0x00400FcbF0816bebB94654259de7273f4A05c762',
		color: '#7D72FC'
	},
	PACT: {
		name: CoinsName.PACT,
		coinUrl: CoinsURL.PACT,
		value: CoinsName.PACT,
		lowerName: CoinsNameLower.PACT,
		type: TokenType.Altcoin,
		contractAddress: '0x46c9757c5497c5b1f2eb73ae79b6b67d119b0b58',
		color: "#6190FC"
	},
	ARI: {
		name: CoinsName.ARI,
		coinUrl: CoinsURL.ARI,
		value: CoinsName.ARI,
		lowerName: CoinsNameLower.ARI,
		type: TokenType.Altcoin,
		contractAddress: '0x20677d4f3d0f08e735ab512393524a3cfceb250c',
		color: "#6EA7A2"
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
	PACT: AltCoins;
	ARI: AltCoins;
}
export interface PoofCoins {
	CELO_v2: PoofAltCoins;
	cUSD_v2: PoofAltCoins;
	cEUR_v2: PoofAltCoins;
	cREAL_v2: PoofAltCoins;
	CELO_v1: PoofAltCoins;
	cUSD_v1: PoofAltCoins;
	cEUR_v1: PoofAltCoins;
	cREAL_v1: PoofAltCoins;
}

export interface AltCoins {
	name: CoinsName;
	coinUrl: CoinsURL;
	value: CoinsName;
	lowerName: CoinsNameLower;
	type: TokenType;
	contractAddress: string;
	color: string;
}
export interface PoofAltCoins {
	name: PoofCoinsName;
	coinUrl: CoinsURL;
	value: PoofCoinsName;
	lowerName: CoinsNameLower;
	type: TokenType;
	contractAddress: string;
}
