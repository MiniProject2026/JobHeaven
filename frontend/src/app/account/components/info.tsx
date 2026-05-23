import { AccountProps } from "@/type";
import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Briefcase, FileText,Mail,Phone,NotepadText } from "lucide-react";
import Link from "next/link"
const Info:React.FC<AccountProps>=({user,isYourAccount})=>{
    const [btnLoading,setBtnLoading]=useState(false);
    const inputRef=useRef<HTMLInputElement|null>(null);
    const editRef=useRef<HTMLInputElement|null>(null);
    const resumeRef=useRef<HTMLInputElement|null>(null);
    const [name,setName]=useState("");
    const [phoneNumber,setPhoneNumber]=useState("");
    const [bio,setBio]=useState("");
    const handleClick=()=>{
        inputRef.current?.click();
    };
    return (
        <div className='max-w-5xl mx-auto px-4 py-8'>
            <Card className='overflow-hidden shadow-lg border-2'>
                <div className="h-32 bg-blue-500 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-xl bg-background">
                                <img src={user.profile_pic? user.profile_pic: "/user.png"} alt="" className="w-full h-full object-cover"/>
                            </div>
                            {/*edit option for your account*/}
                        </div>
                    </div>
                </div>
                {/*main content*/}
                <div className="pt-20 pb-8 px-8">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    {user.name}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 text-sm opacity-70">
                                <Briefcase size={16}/>
                                <span className="capitalize">{user.role}</span>
                            </div>
                        </div>
                    </div>
                    {/* bio section*/}
                    {user.role==="jobseeker" && user.bio&&(
                        <div className="mt-6 p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2 text-sm font-medium opacity-70">
                                <FileText size={16}/>
                            </div>
                            <p className="text-base leading-relaxed">{user.bio}</p>
                            </div>
                    )}
                    {/* contact info*/}
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Mail size={20} className="text-blue-600"/>
                                Contact Information
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <Mail size={18} className="text-blue-600"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs opacity-70 font-medium">Email</p>
                                    <p className="text-sm truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <Phone size={18} className="text-blue-600"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs opacity-70 font-medium">Phone</p>
                                    <p className="text-sm truncate">{user.phone_number}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* resume section*/}
                    {user.role==="jobseeker" && user.resume&&(
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold mt-4 flex-items-center gap-2 ">
                                <NotepadText size={20} className="text-blue-600"/>
                                Resume
                            </h2>
                            <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                                <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex-items-center justify-center">
                                    <NotepadText size={20} className="text-red-600"/>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Resume Document</p>
                                    <Link href={user.resume} className="text-sm text-blue-500 hover:underline" target="_blank">
                                    View Resume PDF
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
export default Info