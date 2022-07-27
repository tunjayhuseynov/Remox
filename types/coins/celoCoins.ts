import { Coins, CoinsName, CoinsURL, TokenType } from ".";

export const CeloCoins: Coins = {
	CELO: {
		name: CoinsName.CELO,
		coinUrl: CoinsURL.CELO,
		type: TokenType.GoldToken,
		contractAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438',
		color: "#fbce5c",
		decimals: 18
	},
	cUSD: {
		name: CoinsName.cUSD,
		coinUrl: CoinsURL.cUSD,
		type: TokenType.StableToken,
		contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
		color: "#46cd85",
		decimals: 18
	},
	cEUR: {
		name: CoinsName.cEUR,
		coinUrl: CoinsURL.cEUR,
		type: TokenType.StableToken,
		contractAddress: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
		color: "#040404",
		decimals: 18
	},
	cREAL: {
		name: CoinsName.cREAL,
		coinUrl: CoinsURL.cREAL,
		type: TokenType.StableToken,
		contractAddress: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
		color: "#e904a3",
		decimals: 18
	},
	UBE: {
		name: CoinsName.UBE,
		coinUrl: CoinsURL.UBE,
		type: TokenType.Altcoin,
		contractAddress: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
		color: "#6D619A",
		decimals: 18
	},
	MOO: {
		name: CoinsName.MOO,
		coinUrl: CoinsURL.MOO,
		type: TokenType.Altcoin,
		contractAddress: '0x17700282592D6917F6A73D0bF8AcCf4D578c131e',
		color: '#3288ec',
		decimals: 18
	},
	MOBI: {
		name: CoinsName.MOBI,
		coinUrl: CoinsURL.MOBI,
		type: TokenType.Altcoin,
		contractAddress: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
		color: '#e984a0',
		decimals: 18
	},
	POOF: {
		name: CoinsName.POOF,
		coinUrl: CoinsURL.POOF,
		type: TokenType.Altcoin,
		contractAddress: '0x00400FcbF0816bebB94654259de7273f4A05c762',
		color: '#7D72FC',
		decimals: 18
	},
	PACT: {
		name: CoinsName.PACT,
		coinUrl: CoinsURL.PACT,
		type: TokenType.Altcoin,
		contractAddress: '0x46c9757c5497c5b1f2eb73ae79b6b67d119b0b58',
		color: "#6190FC",
		decimals: 18
	},
	ARI: {
		name: CoinsName.ARI,
		coinUrl: CoinsURL.ARI,
		type: TokenType.Altcoin,
		contractAddress: '0x20677d4f3d0f08e735ab512393524a3cfceb250c',
		color: "#6EA7A2",
		decimals: 18
	},
	mCELO: {
		name: CoinsName.mCELO,
		coinUrl: CoinsURL.mCELO,
		type: TokenType.YieldToken,
		contractAddress: '0x7D00cd74FF385c955EA3d79e47BF06bD7386387D',
		color: "#fbce5c",
		decimals: 18
	},
	mcUSD: {
		name: CoinsName.mcUSD,
		coinUrl: CoinsURL.mcUSD,
		type: TokenType.YieldToken,
		contractAddress: "0x918146359264C492BD6934071c6Bd31C854EDBc3",
		color: "#46cd85",
		decimals: 18
	},
	mcEUR: {
		name: CoinsName.mcEUR,
		coinUrl: CoinsURL.mcEUR,
		type: TokenType.YieldToken,
		contractAddress: "0xE273Ad7ee11dCfAA87383aD5977EE1504aC07568",
		color: "#040404",
		decimals: 18
	},
	mcREAL: {
		name: CoinsName.mcREAL,
		coinUrl: CoinsURL.mcREAL,
		type: TokenType.YieldToken,
		contractAddress: "0x9802d866fdE4563d088a6619F7CeF82C0B991A55",
		color: "#e904a3",
		decimals: 18
	}
};

