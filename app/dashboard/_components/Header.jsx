'use client'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

const Header = () => {

    const path = usePathname()

    useEffect(() => {
        console.log(path)
    }, [])

    return (
        <div className='flex p-4 px-10 items-center justify-between bg-secondary shadow-md'>
            <div className=' '>
                <div className='font-semibold rounded-lg border shadow-sm px-10 py-3 w-full h-full bg-slate-100'>
                    Add Budget
                </div>
            </div>
            <div className="">
                <h1 className='text-lg font-semibold'>StockSmart</h1>
            </div>
            <UserButton />
        </div>
    )
}

export default Header