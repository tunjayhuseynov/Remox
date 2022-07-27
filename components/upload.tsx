import { Dispatch, useEffect } from 'react';
import { useDropzone } from 'react-dropzone'
import { UseFormRegister } from 'react-hook-form';
import {IFormInput} from '../pages/create-organization.page'

export default function Upload({ setFile,className }: { setFile: Dispatch<File>,className?:string }) {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

    useEffect(() => {
        if (acceptedFiles.length > 0) {
            setFile && setFile(acceptedFiles[0])
        }
    }, [acceptedFiles])

    const files = acceptedFiles.map(file => (
        <li key={file.name}>
            {file.name} - {(file.size / 1024).toPrecision(2)} mb
        </li>
    ));

    return <section>
        <div {...getRootProps({ className: ` ${className} h-[11.375rem] border bg-white dark:bg-darkSecond border-dashed rounded-lg flex justify-center items-center` })}>
            <input  type="file"   {...getInputProps()} /> 
            {files.length > 0 ?
                <aside>
                    <ul>{files}</ul>
                </aside> :
                <div>
                    <div className="text-center">Drag and drop files or <span className="text-primary">Browse your folder</span></div>
                </div>
            }
        </div>
    </section>
}
