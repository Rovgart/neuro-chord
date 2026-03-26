import { ReactNode } from "react";

export default function Layout({children}:{children:ReactNode}){
    return (
        <div className="min-h-screen flex justify-center items-center ">{children}</div>
    )
}