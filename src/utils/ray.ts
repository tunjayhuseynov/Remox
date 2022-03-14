import BigNumber from 'bignumber.js';

const ray = '1000000000000000000000000000';
export const etherSize = '1000000000000000000';

type Num = string | number;

export function BN(num: Num) {
	return new BigNumber(num);
}

export function toWei(num: Num) {
	return BN(num).times(etherSize).toString();
}

export function fromWei(num: Num) {
    return BN(num).div(etherSize).toString()
}

export function print(num: Num) {
	return BN(num).dividedBy(etherSize).toFixed();
}

export function printRay(num: Num) {
	return BN(num).dividedBy(ray).toFixed();
}

export function printRayRate(num: Num) {
	return BN(num).dividedBy(ray).multipliedBy(BN(100)).toFixed(2) + '%';
}
