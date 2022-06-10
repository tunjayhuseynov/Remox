import useInsight from 'rpcHooks/useInsight';
import Loader from 'components/Loader';

const Boxinsight = ({ insight }: { insight: ReturnType<typeof useInsight> }) => {
    const {
        TotalBalancePercentage,
        accountAge,
        averageSpend,
        lastIn,
        lastOut,
        totalBalance
    } = insight;
    
    const boxdata = [
        {
            id: '1',
            header: "Actual total balance",
            interest: TotalBalancePercentage ? `${TotalBalancePercentage}` : undefined,
            money: totalBalance?.toFixed(2),
        },
        {
            id: '2',
            header: "Money in",
            money: lastIn?.toFixed(2),
        },
        {
            id: '3',
            header: "Money out",
            money: lastOut?.toFixed(2),
        },
        {
            id: 4,
            header: "Net change",
            money: (lastIn || lastIn === 0) && (lastOut || lastOut === 0) ? `${(lastIn - lastOut).toFixed(2)}` : '',
        },
        {
            id: 5,
            header: "Average monthly spending",
            money: averageSpend?.toFixed(2)
        },
        {
            id: 6,
            header: "Runway",
            text: accountAge?.toFixed(1),
            endnum: "Months",
        },
    ]

    return <>
        {boxdata.map((w) => {
            return <div key={w.id} className="bg-greylish bg-opacity-10 dark:bg-darkSecond rounded-xl h-[6.25rem]  p-3  ">
                <div className="flex justify-between">
                    <p className="font-bold text-sm">{w.header}</p><p style={
                        w.interest && parseFloat(w.interest) !== 0 ? parseFloat(w.interest) > 0 ? { color: 'green' } : { color: 'red' } : { color: 'black' }
                    }>
                        {w.interest && parseFloat(w.interest) !== 0 ? `${parseFloat(w.interest).toFixed(2)}%` : ''}
                    </p>
                </div>
                <h1 className="text-2xl pl-2 pt-4 font-bold">{w.text} {w.money ? <span>${w.money.split('.')[0]}{w.money.split('.')[1] && <span className="text-greylish text-lg">.{w.money.split('.')[1]}</span>} </span> : !w.text && <Loader />}  {w.endnum && <span className="text-greylish opacity-80 tracking-wider text-xl">{w.endnum}</span>}</h1>
            </div>
        })}

    </>

}

export default Boxinsight 