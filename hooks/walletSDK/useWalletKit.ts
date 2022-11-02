import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { useCallback, useMemo } from "react";
import { AltCoins, Coins, TokenType } from "types";
import { TextDecoder, TextEncoder } from "util";
import { GetSignedMessage, GetTime } from "utils";
import {
  addPayTransaction,
  removeRecurringTask,
  SelectBlockchain,
  SelectCurrencies,
  SelectID,
  SelectIsModerator,
  setBlockchain as SetBlockchain,
} from "redux/slices/account/remoxData";
import { FetchPaymentData } from "redux/slices/account/thunks/payment";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { IPaymentInput, ISendTx, ISwap } from "pages/api/payments/send/index.api";
import Web3 from "web3";
import { Contracts } from "rpcHooks/Contracts/Contracts";
import useAllowance from "rpcHooks/useAllowance";
import { DateInterval } from "types/dashboard/contributors";
import { ITag } from "pages/api/tags/index.api";
import { IAccount, IBudget, INotes, IRemoxPayTransactions, ISubBudget } from "firebaseConfig";
import useMultisig from "./useMultisig";
import { AddTransactionToTag } from "redux/slices/account/thunks/tags";
import { Add_Tx_To_Budget_Thunk } from "redux/slices/account/thunks/budgetThunks/budget";
import { Add_Tx_To_Subbudget_Thunk } from "redux/slices/account/thunks/budgetThunks/subbudget";
import { IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { Refresh_Data_Thunk } from "redux/slices/account/thunks/refresh/refresh";
import { ethers } from "ethers";
import useWeb3Connector from "hooks/useWeb3Connector";
import { Blockchains, BlockchainType } from "types/blockchains";
import { useCelo } from "@celo/react-celo";
import { generate } from "shortid";
import { Add_Tx_To_TxList_Thunk } from "redux/slices/account/thunks/transaction";
import { hexToNumberString } from "web3-utils";
import { ToastRun } from "utils/toast";
import { Refresh_Balance_Thunk } from "redux/slices/account/thunks/refresh/balance";
import { Refresh_Accounts_Thunk } from "redux/slices/account/thunks/refresh/account";
import { Add_Notes_Thunk } from "redux/slices/account/thunks/notes";
import { newKit } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import { DecimalConverter } from "utils/api";


export enum CollectionName {
  Celo = "currencies",
  Evm = "currencies",
  Solana = "solanaCurrencies",
}

export interface Task {
  interval: DateInterval | "instant" | number;
  startDate: number;
}

export default function useWalletKit() {
  const blockchain = useAppSelector(SelectBlockchain) as BlockchainType;
  const dispatch = useAppDispatch();
  const coins = useAppSelector(SelectCurrencies);
  const isModerator = useAppSelector(SelectIsModerator);

  const id = useAppSelector(SelectID)

  const { allow, allowData } = useAllowance();

  const { submitTransaction } = useMultisig();

  const { setVisible } = useWalletModal();

  //Celo
  const { address, destroy, kit, walletType, connect, initialised } = useCelo();

  //solana
  const { connection } = useConnection();
  const {
    publicKey,
    sendTransaction,
    signMessage,
    disconnect,
    wallet,
    connect: solConnect,
    connected,
    signTransaction,
    signAllTransactions,
  } = useWallet();

  // EVM_WALLET
  const {
    connect: web3Connect,
    signMessage: web3SignMessage,
    address: web3Address,
    connected: web3Connected,
    wallet: web3Wallet,
  } = useWeb3Connector();

  const setBlockchain = (bc: BlockchainType) => {
    dispatch(SetBlockchain(bc));
  };

  const setBlockchainAuto = () => {
    if (address) {
      dispatch(SetBlockchain(Blockchains.find((bc) => bc.name === "celo")!));
    } else if (publicKey) {
      dispatch(SetBlockchain(Blockchains.find((bc) => bc.name === "solana")!));
    }
  };

  const SpiralAPR = useCallback(async () => {
    if (blockchain.name === "celo") {
      const epochRewardsContract = await newKit(blockchain.rpcUrl)._web3Contracts.getEpochRewards()

      const [rewardsMultiplierFraction, { 0: targetVotingYieldFraction }] = await Promise.all([
        epochRewardsContract.methods.getRewardsMultiplier().call(),
        epochRewardsContract.methods.getTargetVotingYieldParameters().call(),
      ]);

      // EpochRewards contract is using Fixidity library which operates on decimal part of numbers
      // Fixidity is always using 24 length decimal parts
      const fixidityDecimalSize = new BigNumber(10).pow(24);
      const targetVotingYield = new BigNumber(targetVotingYieldFraction).div(fixidityDecimalSize);
      const rewardsMultiplier = new BigNumber(rewardsMultiplierFraction).div(fixidityDecimalSize);

      // Target voting yield is for a single day only, so we have to calculate this for entire year
      const unadjustedAPR = targetVotingYield.times(365);

      // According to the protocol it has to be adjusted by rewards multiplier
      const adjustedAPR = unadjustedAPR.times(rewardsMultiplier);

      const percentageAPR = adjustedAPR.times(100);
      return percentageAPR.toFixed(2);
    }
  }, [])

  const signMessageInWallet = useCallback(
    async (nonce: number) => {
      if (blockchain.name === "celo") {
        const wallet = kit.getWallet();
        if (!wallet) throw new Error("No wallet");
        const address = ethers.utils.getAddress((await Address)!);

        const signature = await kit.connection.web3.eth.personal.sign(
          GetSignedMessage(nonce),
          address,
          ""
        );
        return {
          publicKey: Address!,
          signature,
        };
      }

      if (blockchain.name.includes("evm")) {
        return {
          publicKey: web3Address,
          signature: await web3SignMessage(GetSignedMessage(nonce)),
        };
      }

      const encodedMessage = new TextEncoder().encode(GetSignedMessage(nonce));
      if (!signMessage) throw new Error("signMessage not found");
      const signature = await signMessage(encodedMessage);
      return {
        publicKey: Address!,
        signature: new TextDecoder().decode(signature),
      };
    },
    [blockchain, kit]
  );

  const GetCoins = useMemo(() => {
    return coins;
  }, [coins]);

  const Address = useMemo(async (): Promise<string | null> => {
    if (blockchain.name === "celo") {
      return address ?? null;
    } else if (blockchain.name === "solana") {
      return publicKey?.toBase58() ?? null;
    } else if (blockchain.name.includes("evm")) {
      const address = await web3Address;
      return address ?? null;
    }
    return address ?? null; // Has to be change to null
  }, [blockchain, publicKey, address]);

  const Connected = useMemo(() => {
    if (blockchain.name === "celo") {
      return initialised;
    } else if (blockchain.name === "solana") {
      return connected;
    } else if (blockchain.name.includes("evm")) {
      return web3Connected;
    }
    return initialised; // Has to be change to null
  }, [blockchain, publicKey, address, initialised, connected]);

  const Disconnect = useCallback(async () => {
    if (blockchain.name === "celo") {
      await destroy();
    } else if (blockchain.name === "solana") {
      await disconnect();
    }
    // else if (blockchain.name.includes("evm")){
    //     await web3Disconnect()
    // }
  }, [blockchain]);

  const Connect = useCallback(async () => {
    try {
      if (blockchain.name === "solana") {
        setVisible(true);
        return undefined;
      } else if (blockchain.name.includes("evm")) {
        const connector = await web3Connect();
        return connector;
      }

      let connection = await connect();
      return connection;
    } catch (error) {
      console.error(error);
    }
  }, [blockchain]);

  const Wallet = useMemo(() => {
    if (blockchain.name === "solana" && wallet) {
      return wallet.adapter.name;
    } else if (blockchain.name.includes("evm") && web3Wallet) {
      return web3Wallet;
    }

    return walletType;
  }, [blockchain, walletType, wallet]);

  const Collection = useMemo(() => {
    if (blockchain.name === "celo") {
      return CollectionName.Celo;
    } else if (blockchain.name === "solana" && wallet) {
      return CollectionName.Solana;
    } else if (blockchain.name.includes("evm")) {
      return CollectionName.Evm;
    }
    return CollectionName.Celo;
  }, [blockchain]);

  const SendTransaction = useCallback(
    async (
      account: IAccount,
      inputArr: IPaymentInput[],
      {
        tags,
        createStreaming = false,
        startTime,
        endTime,
        budget,
        subbudget,
        swap,
        cancelStreaming,
        streamingIdTxHash,
        streamingIdDirect,
        notes,
        payTransactions
      }: {
        tags?: ITag[];
        createStreaming?: boolean;
        startTime?: number;
        endTime?: number;
        budget?: IBudgetORM | null;
        subbudget?: ISubbudgetORM | null;
        swap?: ISwap;
        cancelStreaming?: boolean;
        streamingIdTxHash?: string,
        streamingIdDirect?: string,
        notes?: INotes,
        payTransactions?: IRemoxPayTransactions
      } = {}
    ) => {
      try {
        if (isModerator) return ToastRun("Moderator cannot execute any transaction", "warning")
        let txhash;
        let type: "single" | "multi" = "single";
        let streamId: string | null = null;

        // const Address = account.address;

        if (!blockchain) throw new Error("blockchain not found");
        if (!id) throw new Error("Your session is not active")
        if (!Address) throw new Error("Address not set");
        if (inputArr.length === 0 && !swap && !cancelStreaming && !createStreaming) throw new Error("No inputs");

        if (cancelStreaming && streamingIdTxHash) {
          const web3 = new Web3(blockchain.rpcUrl);
          streamId = hexToNumberString((await web3.eth.getTransactionReceipt(streamingIdTxHash)).logs[1].topics[1])
        } else if (cancelStreaming && streamingIdDirect) {
          streamId = streamingIdDirect
        }

        let txData = await dispatch(
          FetchPaymentData({
            walletAddress: account.address,
            blockchain: blockchain.name,
            executer: account.address,
            requests: inputArr,
            endTime: endTime ?? null,
            startTime: startTime ?? null,
            createStreaming: createStreaming,
            swap: swap ?? null,
            cancelStreaming: cancelStreaming ?? null,
            streamId: streamId,
            providerName: account.provider
          })
        ).unwrap();

        if (blockchain.name.includes("evm")) {

        }

        if (blockchain.name === "celo") {
          const destination = Array.isArray(txData) ? "" : txData.destination as string;
          const data = Array.isArray(txData) ? "" : txData.data as string;
          const value = Array.isArray(txData) ? 0 : txData.value;
          const web3 = new Web3(kit.connection.web3.givenProvider);


          let option = {
            data,
            gas: "500000",
            from: account.address,
            to: destination,
            gasPrice: "500000000",
            value: "0",
          };



          if (account.signerType === "single") { // SINGLE SIGNER

            if (inputArr.length > 1 && account.provider !== "GnosisSafe") {
              const approveArr = await GroupCoinsForApprove(inputArr, GetCoins);

              for (let index = 0; index < approveArr.length; index++) {
                await allow(
                  account.address,
                  approveArr[index].coin,
                  Contracts.BatchRequest.address,
                  approveArr[index].amount.toString(),
                  account.signerType === "single" ? account.address : ((await Address)! as string)
                );
              }
            }

            if (swap) {
              await allow(
                account.address,
                swap.inputCoin,
                blockchain.swapProtocols[0].contractAddress,
                swap.amount,
                account.signerType === "single" ? account.address : (await Address)!
              );
            }
            if (createStreaming) {
              await allow(
                account.address,
                coins[inputArr[0].coin],
                blockchain.streamingProtocols[0].contractAddress,
                inputArr[0].amount.toString(),
                account.signerType === "single" ? account.address : (await Address)!
              )
            }

            const recipet = await web3.eth.sendTransaction(option).on('confirmation', function (num, receipt) {
              if (num > 23) {

                dispatch(Add_Tx_To_TxList_Thunk({
                  account: account,
                  authId: id,
                  blockchain: blockchain,
                  txHash: receipt.transactionHash,
                  tags: tags,
                }))

                dispatch(Refresh_Balance_Thunk({
                  blockchain: blockchain,
                }))
                dispatch(Refresh_Accounts_Thunk({
                  id: account.id,
                }))

                if (payTransactions) {
                  dispatch(addPayTransaction(payTransactions))
                }

                ToastRun("Transaction've been mined", "success")
              }

            });
            const hash = recipet.transactionHash;
            type = "single"
            txhash = hash;

          }
          else { // MULTISIGNER

            if (!account.provider) throw new Error("Provider not found")
            if (swap) {
              const data = await allowData(account.address, swap.inputCoin, blockchain.swapProtocols[0].contractAddress, swap.amount.toString(), account.address)
              txData = [{
                data: data,
                destination: swap.inputCoin.address,
                value: 0,
              }, (txData as ISendTx)]
            }
            if (createStreaming) {
              const coin = coins[inputArr[0].coin]
              const data = await allowData(account.address, coin, blockchain.streamingProtocols[0].contractAddress, inputArr[0].amount.toString(), account.address)
              txData = [{
                data: data,
                destination: coin.address,
                value: 0,
              }, (txData as ISendTx)]
            }
            const txHash = await submitTransaction(
              account,
              txData,
              account.provider,
              undefined,
              tags
            );
            txhash = txHash;
            type = "multi"
          }

        } else if (
          blockchain.name === "solana" &&
          publicKey &&
          signTransaction &&
          signAllTransactions
        ) {
          const data = Array.isArray(txData) ? [] : txData.data as TransactionInstruction[];
          const destination = Array.isArray(txData) ? "" : txData.destination;

          if (account.signerType === "multi") {
            if (!account.provider) throw new Error("Provider not found")
            const txHash = await submitTransaction(
              account,
              txData,
              account.provider
            );
            txhash = txHash;
            type = "multi"
            // dispatch(Refresh_Data_Thunk());
          } else {
            const transaction = new Transaction();
            transaction.add(...data);

            const signature = await sendTransaction(transaction, connection);
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
              blockhash: latestBlockHash.blockhash,
              lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
              signature: signature,
            });
            txhash = signature;
            type = "single"
          }
        }
        // if (txhash) {
        //   if (tags && tags.length > 0 && type) {
        //     for (const tag of tags) {
        //       await dispatch(
        //         AddTransactionToTag({
        //           id: account.id,
        //           tagId: tag.id,
        //           transaction: {
        //             id: generate(),
        //             address: account.address,
        //             hash: txhash,
        //             contractType: type,
        //             provider: account.provider
        //           },
        //         })
        //       ).unwrap();
        //     }
        //   }
        // }


        if (budget && txhash) {
          for (const input of inputArr) {
            await dispatch(
              Add_Tx_To_Budget_Thunk({
                budget: budget,
                tx: {
                  protocol: account.provider,
                  contractAddress: account.address,
                  contractType: account.signerType,
                  isSendingOut: true,
                  hashOrIndex: txhash,
                  amount: input.amount,
                  token: input.coin,
                  timestamp: GetTime(),
                },
                isExecuted: account.signerType === "single",
              })
            ).unwrap();

            if (subbudget) {
              await dispatch(
                Add_Tx_To_Subbudget_Thunk({
                  subbudget: subbudget,
                  tx: {
                    protocol: account.provider,
                    contractAddress: account.address,
                    contractType: account.signerType,
                    isSendingOut: true,
                    hashOrIndex: txhash,
                    amount: input.amount,
                    token: input.coin,
                    timestamp: GetTime(),
                  },
                })
              ).unwrap();
            }
          }
        }
        if (cancelStreaming && streamId) {
          dispatch(removeRecurringTask({
            streamId: streamId,
          }))
        }

        if (notes && txhash) {
          dispatch(Add_Notes_Thunk({
            note: {
              address: account.address,
              attachLink: notes.attachLink,
              hashOrIndex: txhash,
              notes: notes.notes
            }
          }))
        }


        // dispatch(Refresh_Balance_Thunk({
        //   blockchain: blockchain,
        // }))
        // dispatch(Refresh_Accounts_Thunk({
        //   id: account.id,
        // }))
        // await dispatch(Refresh_Data_Thunk()).unwrap();
        return txhash;
      } catch (error) {
        throw Error(error as any);
      }
    },
    [blockchain, publicKey, address]
  );

  return {
    Address,
    Disconnect,
    blockchain,
    Wallet,
    setBlockchain,
    Connect,
    Connected,
    GetCoins,
    SendTransaction,
    Collection,
    setBlockchainAuto,
    signMessageInWallet,
    SpiralAPR
  };
}

export const GroupCoinsForApprove = async (
  inputArr: IPaymentInput[],
  GetCoin: Coins
) => {
  const approveArr: { coin: AltCoins; amount: number }[] = [];

  for (let index = 0; index < inputArr.length; index++) {
    const element = inputArr[index];
    const coin = GetCoin[element.coin];
    if (!approveArr.some((e) => e.coin.name === coin.name)) {
      approveArr.push({ coin: coin, amount: element.amount });
    } else {
      approveArr.find((e) => e.coin.name === coin.name)!.amount +=
        element.amount;
    }
  }

  return approveArr;
};