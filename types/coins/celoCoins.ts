import { Coins, CoinsName, CoinsURL, TokenType } from ".";

export enum PoofCoinsName {
	CELO_V2 = 'CELO_v2',
	cUSD_V2 = 'cUSD_v2',
	cEUR_V2 = 'cEUR_v2',
	cREAL_V2 = 'cREAL_v2',
	CELO_V1 = 'CELO_v1',
	cUSD_V1 = 'cUSD_v1',
	cEUR_V1 = 'cEUR_v1',
}

export const PoofCoins: Coins = {
	CELO_v2: {
		name: PoofCoinsName.CELO_V2 as unknown as CoinsName,
		coinUrl: CoinsURL.CELO,
		type: TokenType.GoldToken,
		contractAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438',
		color: "#fbce5c",
	},
	cUSD_v2: {
		name: PoofCoinsName.cUSD_V2 as unknown as CoinsName,
		coinUrl: CoinsURL.cUSD,
		type: TokenType.StableToken,
		contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
		color: "#46cd85"
	},
	cEUR_v2: {
		name: PoofCoinsName.cEUR_V2 as unknown as CoinsName,
		coinUrl: CoinsURL.cEUR,
		type: TokenType.StableToken,
		contractAddress: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
		color: "#040404"
	},
	cREAL_v2: {
		name: PoofCoinsName.cREAL_V2 as unknown as CoinsName,
		coinUrl: CoinsURL.cREAL,
		type: TokenType.StableToken,
		contractAddress: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
		color: "#e904a3"
	},
	CELO_v1: {
		name: PoofCoinsName.CELO_V1 as unknown as CoinsName,
		coinUrl: CoinsURL.CELO,
		type: TokenType.GoldToken,
		contractAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438',
		color: "#fbce5c"
	},
	cUSD_v1: {
		name: PoofCoinsName.cUSD_V1 as unknown as CoinsName,
		coinUrl: CoinsURL.cUSD,
		type: TokenType.StableToken,
		contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
		color: "#46cd85"
	},
	cEUR_v1: {
		name: PoofCoinsName.cEUR_V1 as unknown as CoinsName,
		coinUrl: CoinsURL.cEUR,
		type: TokenType.StableToken,
		contractAddress: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
		color: "#040404"
	}
};

export const CeloCoins: Coins = {
	CELO: {
		name: CoinsName.CELO,
		coinUrl: CoinsURL.CELO,
		type: TokenType.GoldToken,
		contractAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438',
		color: "#fbce5c"
	},
	cUSD: {
		name: CoinsName.cUSD,
		coinUrl: CoinsURL.cUSD,
		type: TokenType.StableToken,
		contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
		color: "#46cd85"
	},
	cEUR: {
		name: CoinsName.cEUR,
		coinUrl: CoinsURL.cEUR,
		type: TokenType.StableToken,
		contractAddress: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
		color: "#040404"
	},
	cREAL: {
		name: CoinsName.cREAL,
		coinUrl: CoinsURL.cREAL,
		type: TokenType.StableToken,
		contractAddress: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
		color: "#e904a3"
	},
	UBE: {
		name: CoinsName.UBE,
		coinUrl: CoinsURL.UBE,
		type: TokenType.Altcoin,
		contractAddress: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
		color: "#6D619A"
	},
	MOO: {
		name: CoinsName.MOO,
		coinUrl: CoinsURL.MOO,
		type: TokenType.Altcoin,
		contractAddress: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
		color: '#3288ec'
	},
	MOBI: {
		name: CoinsName.MOBI,
		coinUrl: CoinsURL.MOBI,
		type: TokenType.Altcoin,
		contractAddress: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
		color: '#e984a0'
	},
	POOF: {
		name: CoinsName.POOF,
		coinUrl: CoinsURL.POOF,
		type: TokenType.Altcoin,
		contractAddress: '0x00400FcbF0816bebB94654259de7273f4A05c762',
		color: '#7D72FC'
	},
	PACT: {
		name: CoinsName.PACT,
		coinUrl: CoinsURL.PACT,
		type: TokenType.Altcoin,
		contractAddress: '0x46c9757c5497c5b1f2eb73ae79b6b67d119b0b58',
		color: "#6190FC"
	},
	ARI: {
		name: CoinsName.ARI,
		coinUrl: CoinsURL.ARI,
		type: TokenType.Altcoin,
		contractAddress: '0x20677d4f3d0f08e735ab512393524a3cfceb250c',
		color: "#6EA7A2"
	},
	mCELO: {
		name: CoinsName.mCELO,
		coinUrl: CoinsURL.mCELO,
		type: TokenType.YieldToken,
		contractAddress: '0x7D00cd74FF385c955EA3d79e47BF06bD7386387D',
		color: "#fbce5c"
	},
	mcUSD: {
		name: CoinsName.mcUSD,
		coinUrl: CoinsURL.mcUSD,
		type: TokenType.YieldToken,
		contractAddress: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
		color: "#46cd85"
	},
	mcEUR: {
		name: CoinsName.mcEUR,
		coinUrl: CoinsURL.mcEUR,
		type: TokenType.YieldToken,
		contractAddress: "0xE273Ad7ee11dCfAA87383aD5977EE1504aC07568",
		color: "#040404"
	},
	mcREAL: {
		name: CoinsName.mcREAL,
		coinUrl: CoinsURL.mcREAL,
		type: TokenType.YieldToken,
		contractAddress: "0x9802d866fdE4563d088a6619F7CeF82C0B991A55",
		color: "#e904a3"
	}
};

export interface PoofCoins {
	CELO_v2: PoofAltCoins;
	cUSD_v2: PoofAltCoins;
	cEUR_v2: PoofAltCoins;
	cREAL_v2: PoofAltCoins;
	CELO_v1: PoofAltCoins;
	cUSD_v1: PoofAltCoins;
	cEUR_v1: PoofAltCoins;
}


export interface PoofAltCoins {
	name: PoofCoinsName;
	coinUrl: CoinsURL;
	type: TokenType;
	contractAddress: string;
}
