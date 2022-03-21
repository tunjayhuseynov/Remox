import {useState} from "react";
import useModalSideExit from '../../hooks/useModalSideExit';
import { useAppSelector } from "../../redux/hooks";
import { selectStorage } from "../../redux/reducers/storage";
import { IoIosArrowDown} from 'react-icons/io';

const Li = ({ children }: { children: any }) => <li className="navbarli text-left flex gap-5 border-b-2 transition  px-5 py-4 bg-white dark:bg-darkSecond   cursor-pointer first:rounded-t-xl last:rounded-b-xl"> {children}</li>
export const WalletDropdown = () => {
    const storage = useAppSelector(selectStorage);
    const [isOpen, setOpen] = useState(false)
    const divRef = useModalSideExit(isOpen, setOpen)

    return <div className="relative">
        <div onClick={() => setOpen(!isOpen)} className="font-normal w-[100px] px-2 sm:px-5 py-2 rounded-xl cursor-pointer bg-greylish bg-opacity-10 flex items-center justify-center ">
            All Wallets
            <div>
                <IoIosArrowDown className='transition' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
            </div>
        </div>
        {isOpen && <div ref={divRef} className="absolute min-w-[150%] rounded-xl sm:-right-0 -bottom-1 translate-y-full shadow-xl z-50">
            <ul >
                <Li> 
                    <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer peer" name="paymentType" value="fiat"  />
                    <label className="font-semibold text-sm peer-checked:text-primary">
                        {storage!.accountAddress}
                    </label></Li>
                    <Li> 
                    <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer peer" name="paymentType" value="fiat"  />
                    <label className="font-semibold text-sm peer-checked:text-primary">
                        {storage!.accountAddress}
                    </label></Li>
                    <Li> 
                    <input type="radio" className="w-4 h-4 accent-[#ff501a] cursor-pointer peer" name="paymentType" value="fiat"  />
                    <label className="font-semibold text-sm peer-checked:text-primary">
                        {storage!.accountAddress}
                    </label></Li>
            </ul>
        </div>
        }
    </div>
}