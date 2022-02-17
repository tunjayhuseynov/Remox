import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useFirestoreSearchField } from "../API/useFirebase";
import { IUser } from "../firebase";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { useAppSelector } from "redux/hooks";


const Home = () => {
    const { connect, address } = useContractKit();
    const { search, isLoading } = useFirestoreSearchField<IUser>()
    const dark = useAppSelector(selectDarkMode)
    const navigate = useNavigate()

    const connectEvent = async () => {
        try {
            if (!address) {
                await connect()
            }
            if (address) {
                search("users", 'address', address)
                    .then(user => {
                        if (user) {
                            navigate('/unlock')
                        } else {
                            navigate('/create-account')
                        }

                    })
            }
        } catch (error) {
            console.error(error)
        }
    }

    return <>
        <section className="flex justify-center items-center w-full h-screen">
            <div className="w-[800px] h-[600px] bg-[#eeeeee] dark:bg-darkSecond bg-opacity-40 flex flex-col justify-center items-center gap-14">
                <div className="w-[200px] sm:w-[400px] flex flex-col items-center justify-center gap-10">
                <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" className="w-full" />
                    <span className="font-light text-greylish text-center">Contributor and Treasury Management Platform</span>
                </div>
                <div className="flex flex-col gap-5">
                    {<Button onClick={connectEvent} isLoading={isLoading}>{address ? "Enter App" : "Connect to a wallet"}</Button>}
                </div>
            </div>
        </section>
    </>

};

export default Home;