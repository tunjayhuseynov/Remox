export interface GetBalanceResponse {
	[name: string]: string;
	CELO: string;
	cUSD: string;
	cEUR: string;
	UBE: string;
	MOO: string;
	MOBI: string;
	POOF: string;
	cREAL: string;
}

export enum GetBalanceResponseEnum {
	CELO = 'CELO',
	cUSD = 'cUSD',
	cEUR = 'cEUR',
	UBE = 'UBE',
	MOO = 'MOO',
	MOBI = 'MOBI',
	POOF = 'POOF',
	cREAL = 'cREAL'
}
