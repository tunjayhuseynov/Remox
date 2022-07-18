export { default as AddOwner } from './addOwner';
export { default as ChangeTreshold } from './changeTreshold';
export { default as RemoveOwner } from './removeOwner';
export { default as ReplaceOwner } from './replaceOwner';

export interface IOwnerFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;
    address: string;
    email?: string;

}