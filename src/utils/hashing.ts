import { AES, enc } from 'crypto-js';
//@ts-ignore
import Hash from "ipfs-only-hash"

export const hashing = async (...rest: string[]) => {
	return await Hash.of(rest.reduce((acc, cur) => acc + cur));
};

export const compareHashes = async (hash1: string, ...rest: string[]) => {
	const hash2 = await Hash.of(rest.reduce((acc, cur) => acc + cur));
	return hash2 === hash1;
};

export const encryptMessage = function(messageToencrypt = '', secretkey = '') {
	var encryptedMessage = AES.encrypt(messageToencrypt, secretkey);
	return encryptedMessage.toString();
};

export const decryptMessage = function(encryptedMessage = '', secretkey = '') {
	var decryptedBytes = AES.decrypt(encryptedMessage, secretkey);
	var decryptedMessage = decryptedBytes.toString(enc.Latin1);

	return decryptedMessage;
};
