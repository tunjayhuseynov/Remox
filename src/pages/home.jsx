import Navbar from "../components/navbar";
import Footer from "../components/footer";

const imgShadow = { boxShadow: "0px 5px 8px 0px #aaaaaa" }

const Case = ({ name, subname, img, className }) => <div className={'relative'}>
    <div className={`flex flex-col items-center justify-center gap-7 ${className ?? ''}`}>
        <div className="w-full flex justify-center">
            <img src={`/icons/${img}.png`} className="h-[100px] object-bottom" alt="" />
        </div>
        <div className="flex flex-col justify-center items-center gap-4">
            <h2 className="text-xl">
                {name}
            </h2>
            <span className="text-[#707070]">
                {subname}
            </span>
        </div>
    </div>
</div>


const Home = () => <div >
    <Navbar />
    <main>
        <section className="flex flex-col items-center pb-20 px-32">
            <div className="flex flex-col items-center justify-center gap-3 h-[300px]">
                <h3 className="text-primary text-lg">For a DeFi World</h3>
                <h1 className="text-5xl tracking-wide">Treasury Management</h1>
                <h2 className="text-primary text-2xl">Put Your Operations On Autopilot</h2>
                <button className="bg-primary shadow-md px-5 py-2 rounded-lg text-white mt-3">Create Account</button>
            </div>
            <div className="w-full  rounded-xl overflow-hidden" style={imgShadow}>
                <img src="/imgs/dashboard.png" className="object-contain w-full h-full" alt="" />
            </div>
        </section>
        <section className="flex flex-col gap-3 items-center justify-center py-16 bg-[#f1f1f1]">
            <div>
                <h2 className="text-primary text-2xl">Supported by</h2>
            </div>
            <div className="flex w-1/2 gap-4 items-center justify-between">
                <div>
                    <img src="/imgs/floriicon.png" className="w-[250px]" alt="" />
                </div>
                <div>
                    <img src="/imgs/celologo.png" className="w-[250px]" alt="" />
                </div>
            </div>
        </section>
        <section className="flex flex-col items-center gap-20 pb-32 pt-20 px-32">
            <div className="flex flex-col items-center">
                <h2 className="text-2xl text-primary">All the features help you move crypto</h2>
                <span className="tracking-wider font-light text-[#707070]">Remox has everything you need to run businesses on the blockchain ecosystem</span>
            </div>
            <div className="w-full h-[555px] grid grid-cols-[55%,45%] px-4 py-3" style={imgShadow}>
                <div className="flex items-center max-h-[550px] py-3">
                    <img src="/imgs/mass.png" className="h-full w-full object-fill" alt="" />
                </div>
                <div className="flex flex-col justify-center items-center gap-5">
                    <h2 className="text-primary text-3xl">One-Click Mass Payouts</h2>
                    <span className="text-lg font-normal tracking-wide text-center px-36">Move crypto to run a payroll or pay to a group made easy with one-click.</span>
                </div>
            </div>
            <div className="w-full h-[555px] grid grid-cols-[55%,45%] px-4 py-3" style={imgShadow}>
                <div className="flex items-center max-h-[550px] py-3">
                    <img src="/imgs/status.png" className="h-full w-full object-fill" alt="" />
                </div>
                <div className="flex flex-col justify-center items-center gap-5">
                    <h2 className="text-primary text-3xl">Multi-Sig Transactions</h2>
                    <span className="text-lg font-normal tracking-wide text-center px-32">Require multiple team members to confirm every transaction in order to execute it.</span>
                </div>
            </div>
            <div className="w-full h-[555px] grid grid-cols-[60%,40%] px-4 py-3" style={imgShadow}>
                <div className="flex items-center max-h-[550px] py-20">
                    <img src="/imgs/team.png" className="h-full w-full object-fill" alt="" />
                </div>
                <div className="flex flex-col justify-center items-center gap-5">
                    <h2 className="text-primary text-3xl">Manage Teams & People</h2>
                    <span className="text-lg font-normal tracking-wide text-center">Your data is private and end to end data encrypted</span>
                </div>
            </div>
        </section>
        <section className="flex flex-col items-center gap-20 pb-28">
            <div className="flex flex-col items-center">
                <h2 className="text-3xl text-primary">Use Cases</h2>
                <span className="tracking-wider font-light text-[#707070]">To seamlessly manage your crypto treasury</span>
            </div>
            <div className="grid grid-cols-3 h-[150px] gap-36">
                <Case name="Individual" subname="for private crypto assets" img="famous" />
                <Case className="caseMiddle" name="Teams" subname="for company crypto assets" img="team" />
                <Case name="DAO" subname="for managing DAO treasury" img="decentralized" />
            </div>
        </section>
    </main>
    <Footer />
</div>

export default Home;
