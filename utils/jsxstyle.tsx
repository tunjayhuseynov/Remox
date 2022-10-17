

export const NG = ({ fontSize = 1, number, decimalSize }: { number: number, fontSize?: number, decimalSize?: number }) => {

    return <>
        <span style={{
            fontSize: `${fontSize}rem`,
        }}>{Math.floor(number).toLocaleString()}
        </span>
        <span
            style={{
                fontSize: `${fontSize * (decimalSize ? decimalSize / 100 : 0.6)}rem`,
            }}
        >.{(+number.toFixed(2) - Math.floor(number)).toFixed(2).split(".")?.[1] ?? "00"}</span>
    </>
}