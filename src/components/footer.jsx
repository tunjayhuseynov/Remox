import { useState } from 'react'

const Footer = () => {
    const [value, setValue] = useState()


    return <footer className="bg-[#f1f1f1] pt-20 pb-4">
        <section className="flex flex-col items-center justify-center gap-8 pb-20">
            <div className="felx items-center justify-center">
                <h2 className="text-primary text-center text-3xl">Let's stay in touch</h2>
                <span className="text-[#707070]">We will send you updates on the latest news and features. No spam.</span>
            </div>
            <div>
                <div className="p-2 bg-white rounded-3xl shadow-lg" >
                    <input type="text" className={`outline-none transition-all focus:w-[250px] ${value ? 'w-[250px]' : 'w-[150px]'}`} onChange={((e) => setValue(e.target.value))} />
                    <button className={`rounded-3xl text-lg px-5 py-2 bg-primary text-white`}>
                        Subscribe
                    </button>
                </div>
            </div>
        </section>
        <section className="flex justify-center items-center gap-8 pb-16">
            <button className="text-greyful text-lg font-light">Docs</button>
            <button className="text-greyful text-lg font-light">Twitter</button>
            <button className="text-greyful text-lg font-light">Linkedin</button>
        </section>
        <section className="flex justify-center items-center">
            <span className="text-greyful">
                © Romex, Inc 2021.
            </span>
        </section>
    </footer>
}

export default Footer;