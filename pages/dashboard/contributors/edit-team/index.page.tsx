import { IContributor } from "types/dashboard/contributors";
import useContributors from "hooks/useContributors";
import { Dispatch, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { changeError, changeSuccess } from "redux/slices/notificationSlice";
import Button from "../../../../components/button";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  updateContributor,
} from "redux/slices/account/remoxData";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";
import IconTextField from "components/IconTextField";
import { MdDone } from "react-icons/md";
import Loader from "components/Loader";

const EditTeam = () => {
  const { id, name } = useRouter().query as { id : string, name: string }
  console.log(id);
  
  const { editTeam, isLoading } = useContributors();
  const [worksTeamName, setWorksTeamName] = useState<string>(name);
  const dispatch = useAppDispatch();
  const navigate = useRouter()
  const submit  = async () => {
    if(worksTeamName.length == 0 ){

    }
    if (worksTeamName.trim()) {
      try {
        await editTeam(id, worksTeamName.trim());
        dispatch(updateContributor({ name: worksTeamName.trim(), id: id }));
        navigate.back()
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (<div className="w-full mx-auto relative">
    <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all text-primary hover:transition-all flex items-center text-xl gap-2">
      <span className="text-4xl pb-1">&#171;</span> Back
    </button>
    <div
      className="flex flex-col w-[35%] mx-auto  pt-24 items-center justify-center space-y-10"
    >
      <div className="flex items-center justify-center text-xl">
        <div className="text-2xl self-center pt-2 font-semibold ">
          Edit Workstream
        </div>
      </div>
      <div className="flex flex-col w-[85%] ">
        <IconTextField
          label="Workstream Name"
          value={worksTeamName}
          onChange={(e) => setWorksTeamName(e.target.value)}
          iconEnd={isLoading ? <Loader/> : <MdDone onClick={() => submit()} className="cursor-pointer rounded-full bg-primary h-7 w-7 p-1 text-white "/>}
          className={`border pl-3 w-full rounded-xl h-10 py-6 text-lg animate__animated animate__shakeX`}
        />
      </div>
      <div className="flex  gap-x-10 justify-center w-full">
        <Button
          version="second"
          className="px-14 !py-2 font-light"
          onClick={() => {
            navigate.back()
          }}
        >
          Close
        </Button>
      </div>
    </div>
  </div>
  );
};

export default EditTeam;
