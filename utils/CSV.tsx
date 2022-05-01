import { csv } from 'd3-fetch'

export interface csvFormat {
    name: string,
    address: string,
    amount: string
    coin: string
    amount2: string
    coin2: string
}

class CSV {
    static async Import(file: File): Promise<csvFormat[]> {
        return new Promise(async (resolve, reject) => {

            const url = URL.createObjectURL(file)

            const res = await csv(url)
            if (res) {
                if (res.columns.join(';').toLowerCase().includes("name;address;amount;coin;amount2;coin2")) {
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