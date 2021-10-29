

const Navbar = () => <div className="flex items-center justify-between h-[75px] px-32">
    <div>
        <img src="/imgs/logo.png" width="150" alt="" />
    </div>
    <div>
        <button onClick={() => window.open('http://localhost:3000', '_blank')} className="px-12 py-1 bg-primary text-white rounded-xl">
            Enter App
        </button>
    </div>
</div>

export default Navbar;