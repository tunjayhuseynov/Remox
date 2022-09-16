import Loader from 'components/Loader';
import { useWalletKit } from 'hooks';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { IFormattedTransaction } from 'hooks/useTransactionProcess';
import React, { useState } from 'react'
import { useAppSelector } from 'redux/hooks'
import {  SelectNfts } from 'redux/slices/account/remoxData';
import { NFTFetcher } from 'utils/nft';
import { INFT} from '../index.page';
import NftItem from './nftItem';

const NftContainer = () => {
  const {blockchain } = useWalletKit()
  const [loading, setLoading] = useState(false)
  const [nftsDataArray, setNftsDataArray] = useState<INFT[]>([]);
  const nfts = useAppSelector(SelectNfts);

  console.log(nfts)

  useAsyncEffect(async () => {
    setLoading(true)
    const nftDataArray = await Promise.all(
      nfts.map((s: IFormattedTransaction) => getNftData(s))
    )

    setNftsDataArray(nftDataArray)
    setLoading(false)
  }, [nfts])


  const getNftData = async (nft:IFormattedTransaction ) => {
    let url = await NFTFetcher(blockchain , nft.rawData.contractAddress, nft.rawData.tokenID);
    let link = ""
    if (url) {
      link = url.includes("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url
      console.log(url)
    } else {
      throw new Error("Cannot fetch NFT")
    }

    const NFTData: INFT = {
      name: nft.rawData.tokenName,
      text: nft.rawData.tokenSymbol ?? "",
      contractAddress: nft.rawData.contractAddress,
      imageAddress: link
    }

    return NFTData
  }

  if(loading) {
    return <Loader />
  }
  // if(loading) return <div className='w-full flex  justify-center '><Loader/> </div>


  return (
    <div className="w-full h-full  grid grid-cols-3 gap-20 ">
      {nftsDataArray.map((nft: INFT, index: number) => {
        return <NftItem key={index} nft={nft} />
      })}
    </div>
  )
}

export default NftContainer