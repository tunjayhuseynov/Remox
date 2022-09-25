import { csv } from 'd3-fetch'

export interface csvFormat {
    "Name (optional)": string,
    "Wallet address": string,
    "Token 1 id": string
    "Amount 1": string
    "Token 2 id (opt.)": string
    "Amount 2 (opt.)": string
}

class CSV {
    static async Import(file: File): Promise<csvFormat[]> {
        return new Promise(async (resolve, reject) => {

            const url = URL.createObjectURL(file)

            const res = await csv(url)
            if (res) {
                if (res.columns.join(';').includes("Name (optional);Wallet address;Token 1 id;Amount 1;Token 2 id (opt.);Amount 2 (opt.)")) {
                    const result: csvFormat[] = []
                    for (let index = 0; index < res.length; index++) {
                        const data = res[index] as unknown as csvFormat;
                        if (data) {
                            result.push(data)
                        } else {
                            reject(new Error(`Row is null`))
                        }
                    }
                    resolve(result)
                } else {
                    reject(new Error("Columns are invalid. Please, set the column order like that: Name Address Amount Coin"))
                }
            } else {
                reject(new Error(`Cannot import an empty file`))
            }
        })
    }
}

export default CSV;