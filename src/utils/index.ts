

export const AddressReducer = (address: string) => {
    return address.split('').reduce((a, c, i, arr) => {
        return i < 10 || (arr.length - i) < 4 ? a + c : a.split('.').length - 1 < 6 ? a + '.' : a
    }, '')
}

export const WordSplitter = (word: string) => {
    return word.split('').reduce((a, c) => {
        if (c === c.toUpperCase()) return a + ` ${c}`
        return a + c
    }, '')
}