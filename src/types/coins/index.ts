export interface Coins {
	[name: string]: AltCoins;
}

export interface AltCoins {
	name: CoinsName;
	coinUrl: CoinsURL;
	type: TokenType;
	contractAddress: string;
	color: string;
}

export enum TokenType {
	GoldToken = 'GoldToken',
	StableToken = 'StableToken',
	Altcoin = 'Altcoin'
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
	ARI = 'ARI',
	mCELO = 'mCELO',
	mcUSD = 'mcUSD',
	mcEUR = 'mcEUR',
	mcREAL = 'mcREAL',

    //Solana
    SOL = 'SOL',
}

export enum CoinsURL {
	CELO = '/icons/currencies/celoiconsquare.svg',
	cUSD = '/icons/currencies/celodollar.svg',
	cEUR = '/icons/currencies/ceur.png',
	UBE = '/icons/currencies/ubeswap.png',
	MOO = '/icons/currencies/moola.png',
	MOBI = '/icons/currencies/mobius.png',
	POOF = '/icons/currencies/poof.png',
	cREAL = '/icons/currencies/creal.png',
	PACT = '/icons/currencies/pact.png',
	ARI = '/icons/currencies/ari.png',
	mCELO = '/icons/currencies/mCELO.png',
	mcUSD = '/icons/currencies/mcUSD.png',
	mcEUR = '/icons/currencies/mcEUR.png',
	mcREAL = '/icons/currencies/mcREAL.png',

    //Solana
    SOL = '/icons/currencies/sol.png',


	None = ''
}
