
const Avatar = ({ name, surname, className }: { name: string, surname: string, className?: string }) => {

    return <div className={`${className} w-[2.5rem] h-[2.5rem] font-[1.125rem] flex items-center justify-center rounded-full bg-greylish bg-opacity-20`}>
        <span>{name.slice(0, 1)}</span><span>{surname?.slice(0, 1)}</span>
    </div>
}

export default Avatar;