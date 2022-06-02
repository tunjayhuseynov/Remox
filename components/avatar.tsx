
const Avatar = ({ name, className }: { name: string, className?: string}) => {

    return <div className={`${className} w-[2.5rem] h-[2.5rem] font-[1.125rem] flex items-center justify-center rounded-full bg-greylish bg-opacity-20`}>
        {name.slice(0, 2)}
    </div>
}

export default Avatar;