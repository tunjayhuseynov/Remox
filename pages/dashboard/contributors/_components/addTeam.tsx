import { SetStateAction, useState } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks"
import useContributors from "hooks/useContributors";
import { IContributor } from "types/dashboard/contributors";
import { v4 as uuidv4 } from "uuid";
import { GetTime } from "utils";
import { addContributor , SelectStorage } from "redux/slices/account/remoxData";
import { MdDone} from "react-icons/md";
import IconTextField from "components/IconTextField";
import Loader from "components/Loader";

const AddTeam = ({setCreating} : {setCreating : (value: SetStateAction<boolean>) => void}) => {
    const [workstreamName, setWorkstreamName] = useState<string>("");
    const { addTeam, isLoading } = useContributors()
    const storage = useAppSelector(SelectStorage);  
    const dispatch = useAppDispatch()

    

    const submit = async () => {
        if(workstreamName.length == 0 ) {
            return
        }
        if (workstreamName.trim()) {
            try {
                const team : IContributor = {
                    id: uuidv4(),
                    name: workstreamName,
                    members: [],
                    timestamp: GetTime(),
                    userId: storage!.signType === "individual" ? storage!.individual.id : storage!.organization!.id,
                }   
                await addTeam(team);
                dispatch(addContributor([team]));
                setCreating(false)
                setWorkstreamName("")
            } catch (error) {
                console.error(error)
            }
        }
    }


  return (
    <div className="rounded-md cursor-pointer bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313]  hover:shadow-lg px-3  shadow flex  py-2 min-h-[12rem] items-start justify-between">
      <div className="flex items-center justify-center w-full h-full px-4 !text-sm">
        <IconTextField
          label="Name"
          onChange={(e) => setWorkstreamName(e.target.value)}
          value={workstreamName}
          iconEnd={
            isLoading ? (
              <Loader />
            ) : (
              <MdDone
                onClick={() => submit()}
                className="cursor-pointer rounded-full bg-primary h-5 w-5 p-1 text-white "
              />
            )
          }
          className={`border w-full rounded-xl py-6 text-sm`}
        />
      </div>
    </div>
  );
};

export default AddTeam;
