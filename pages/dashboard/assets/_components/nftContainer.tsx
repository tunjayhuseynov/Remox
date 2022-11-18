import Loader from 'components/Loader';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { IFormattedTransaction } from 'hooks/useTransactionProcess';
import React, { useState } from 'react'
import { useAppSelector } from 'redux/hooks'
import { SelectAccounts, SelectNfts } from 'redux/slices/account/remoxData';
import { Blockchains } from 'types/blockchains';
import { NFTFetcher } from 'utils/nft';
import { INFT } from '../index.page';
import NftItem from './nftItem';

const NftContainer = ({ accounts }: { accounts: string[] }) => {
  const [loading, setLoading] = useState(false)
  const [nftsDataArray, setNftsDataArray] = useState<INFT[]>([]);
  const nfts = useAppSelector(SelectNfts)
  const allAcounts = useAppSelector(SelectAccounts)
  

  useAsyncEffect(async () => {
    setLoading(true)
    let sa = allAcounts.filter((account) => accounts.includes(account.id)).map((account) => account.address)
    const nftDataArray = await Promise.all(
      nfts.filter(d => sa.includes(d.address)).map((s: IFormattedTransaction) => getNftData(s))
    )

    setNftsDataArray(nftDataArray)
    setLoading(false)
  }, [nfts, accounts])


  const getNftData = async (nft: IFormattedTransaction) => {
    const blockchain = Blockchains.find(s=>s.name === nft.blockchain)!
    let url = await NFTFetcher(blockchain, nft.rawData.contractAddress, nft.rawData.tokenID);
    let link = ""
    if (url) {
      link = url.includes("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url
    } else {
      throw new Error("Cannot fetch NFT")
    }

    const NFTData: INFT = {
      name: nft.rawData.tokenName,
      text: nft.rawData.tokenSymbol ?? "",
      contractAddress: nft.rawData.contractAddress,
      imageAddress: link,
      value: nft.rawData.value,
      blockchain: blockchain,
    }

    return NFTData
  }

  if (loading) return <div className='w-full flex  justify-center '><Loader /> </div>


  return (
    <div className="w-full h-full grid grid-cols-3 gap-20 mb-10" >
      {nftsDataArray.map((nft: INFT, index: number) => {
        return <NftItem key={index} nft={nft} />
      })}
    </div>
  )
}

export default NftContainer