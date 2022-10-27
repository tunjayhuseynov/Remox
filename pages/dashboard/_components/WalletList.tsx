import { useState, useMemo } from "react";
import { AddressReducer } from "../../../utils";
import useNextSelector from "hooks/useNextSelector";
import Modal from "components/general/modal";
import DeleteWallet from "./deleteWallet";
import {
  SelectDarkMode,
  SelectFiatPreference,
  SelectFiatSymbol,
  SelectIndividual,
  SelectPriceCalculationFn,
  SelectProviderAddress,
} from "redux/slices/account/remoxData";
import CoinItem from "./coinitem";
import useModalSideExit from "hooks/useModalSideExit";
import { IAccountORM } from "pages/api/account/index.api";
import Avatar from "@mui/material/Avatar";
import makeBlockie from "ethereum-blockies-base64";
import EditWallet from "./editWallet";
import { IoTrashOutline } from "react-icons/io5";
import { BiTransferAlt } from "react-icons/bi";
import Deposit from "./Deposit";
import MuiModal from "@mui/material/Modal";
import { Box, Tooltip } from "@mui/material";
import { useAppSelector } from "redux/hooks";
import zIndex from "@mui/material/styles/zIndex";
import { NG } from "utils/jsxstyle";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function WalletList({ item }: { item: IAccountORM }) {
  const individual = useAppSelector(SelectIndividual);
  const providerID = useAppSelector(SelectProviderAddress);

  const [details, setDetails] = useState<boolean>(false);
  const [modalEditVisible, setModalEditVisible] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [depositModal, setDepositModal] = useState<boolean>(false);
  const dark = useNextSelector(SelectDarkMode);
  const [selectcoin, setSelectcoin] = useState<string>("");
  const [customRef] = useModalSideExit<string>(selectcoin, setSelectcoin, "");
  const calculatePrice = useAppSelector(SelectPriceCalculationFn);

  const preference = useAppSelector(SelectFiatPreference);
  const symbol = useAppSelector(SelectFiatSymbol);

  const totalValue = useMemo(() => {
    return item.coins.reduce((a, b) => a + calculatePrice(b), 0);
  }, [preference]);

  const coins = useMemo(() => {
    return item.coins.map((coin) => {
      const percent =
        totalValue > 0 ? (calculatePrice(coin) / totalValue) * 100 : 0;
      return {
        ...coin,
        percent,
      };
    }, []);
  }, [item.coins, totalValue]);

  const [divRef, exceptRef] = useModalSideExit(details, setDetails, false);
  return (
    <>
      <Modal
        onDisable={setModalEditVisible}
        openNotify={modalEditVisible}
        animatedModal={true}
        disableX={true}
      >
        <EditWallet account={item} onDisable={setModalEditVisible} />
      </Modal>
      {deleteModal && (
        <Modal
          onDisable={setDeleteModal}
          animatedModal={false}
          disableX={true}
          className="!pt-4"
        >
          <DeleteWallet onDisable={setDeleteModal} account={item} />
        </Modal>
      )}
      <MuiModal open={depositModal} onClose={() => setDepositModal(false)}>
        <Box sx={style}>
          <Deposit onDisable={setDepositModal} account={item} />
        </Box>
      </MuiModal>

      <div className="shadow-15 pt-2 rounded-md bg-white dark:bg-darkSecond min-w-[21.25rem] hover:transition-all hover:bg-[#f9f9f9] dark:hover:!bg-[#191919]">
        <div className="w-full">
          <div className="pb-2 border-b dark:border-[#454545]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 px-3">
                <div>
                  <img
                    className="rounded-full w-9 aspect-square object-cover"
                    src={
                      item.image?.nftUrl ??
                      (item.image?.imageUrl as string) ??
                      makeBlockie(item.address ?? "")
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-[10px] text-greylish">
                    {AddressReducer(item.address ?? "")}
                  </div>
                </div>
              </div>
              <div
                ref={exceptRef}
                onClick={() => {
                  setDetails(!details);
                }}
                className="relative cursor-pointer  h-7 w-7 text-xl pl-2 font-bold text-greylish text-opacity-70 dark:text-white flex"
              >
                <span className="rotate-90">...</span>
                {details && (
                  <div
                    ref={divRef}
                    className="flex flex-col bg-white dark:bg-darkSecond absolute right-8 w-[8rem] rounded-lg shadow-xl z-50 "
                  >
                    <div
                      className="cursor-pointer border-b dark:border-[#454545] text-sm items-start hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full pl-3 py-2 gap-3"
                      onClick={() => {
                        setModalEditVisible(true);
                      }}
                    >
                      <div className="flex w-full space-x-2">
                        <img
                          src={`/icons/${dark ? "edit_white" : "edit"}.png`}
                          className="dark:invert text-greylish dark:text-white dark:brightness-0 w-4 h-4"
                          alt=""
                        />{" "}
                        <span>Edit</span>
                      </div>
                    </div>
                    <div
                      className="cursor-pointer border-b dark:border-[#454545] text-sm flex w-full hover:bg-greylish hover:bg-opacity-5 hover:transition-all pl-3 pr-12 py-2 gap-3"
                      onClick={() => {
                        setDeleteModal(true);
                      }}
                    >
                      <div className="flex w-full space-x-2">
                        <IoTrashOutline
                          size={20}
                          className="hover:text-red-500"
                        />{" "}
                        <span>Delete</span>
                      </div>
                    </div>
                    <div
                      className="cursor-pointer text-sm flex w-full hover:bg-greylish hover:bg-opacity-5 hover:transition-all pl-3 pr-12 py-2 gap-3"
                      onClick={() => {
                        setDepositModal(true);
                      }}
                    >
                      <div className="flex space-x-2">
                        <BiTransferAlt size={20} className="flex-shrink-0" />{" "}
                        <span>Deposit</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-[27.9%,1fr]">
            <div className="flex flex-col gap-3 py-2 px-[.68rem] items-start border-r dark:border-[#454545]">
              <div className="grid grid-flow-row">
                <div className="text-greylish text-xs">Total Value</div>
                <div className="text-sm font-semibold truncate">
                  <Tooltip
                    title={
                      <>
                        {symbol}
                        <NG number={totalValue} fontSize={.875} />
                      </>
                    }
                  >
                    <>
                      {symbol}
                      <NG number={totalValue} fontSize={.875} />
                    </>
                  </Tooltip>
                </div>
              </div>
                <div className="flex flex-col mr-2 w-full">
                  <div className="text-greylish text-xs mb-6">Signers</div>
                  <div className="relative w-full">
                    <div>
                      {item.members.slice(0,3).map((member, index) => (
                        <Avatar
                          key={member.id}
                          sx={{
                            width: "1.25rem!important",
                            height: "1.25rem!important",
                            position: "absolute",
                            bottom: "0",
                            left: `${index === 0 ? 0 : index === 1 ? 0.8 : index === 2 ? 1.6  : 0}rem`,
                            zIndex: `${zIndex}`,
                            borderWidth: "1px"
                          }}
                          alt={member.name}
                          src={
                            member.address.toLowerCase() ===
                            providerID?.toLowerCase()
                              ? individual?.image?.imageUrl ??
                                makeBlockie(member.address)
                              : member?.image?.imageUrl ??
                                member?.image?.nftUrl ??
                                makeBlockie(member.address)
                          }
                        />
                      ))}
                      {item.members.length > 3 && (
                        <div className="w-[1.25rem] h-[1.25rem] bg-[#E5E5E5] dark:bg-greylish absolute z-5 !bottom-0 left-[2.4rem] flex items-center justify-center !text-xs rounded-full border-[1px]">
                          <span className="text-[10px] font-medium text-[#707070] dark:text-white">
                            +{item.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
            <div className="rounded-xl">
              <div className="w-full h-full" ref={customRef}>
                {coins
                  .sort((a, b) => (a.percent > b.percent ? -1 : 1))
                  .filter((s) => s.amount > 0)
                  .slice(0, 3)
                  .map((item, index) => {
                    return (
                      <div
                        className={`w-[95%] mx-auto ${
                          index !== 2 && "dark:border-[#454545] border-b"
                        }`}
                        key={item.coin.address}
                      >
                        <CoinItem
                          key={item.coin.address + item.coin.name}
                          setSelectcoin={setSelectcoin}
                          onClick={() => {
                            if (item.amount) {
                              setSelectcoin(item.coin.name);
                            }
                          }}
                          selectcoin={selectcoin}
                          title={item.coin.symbol}
                          coin={item.amount}
                          usd={calculatePrice(item)}
                          percent={(item.percent || 0).toFixed(1)}
                          img={item.coin.logoURI}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WalletList;
