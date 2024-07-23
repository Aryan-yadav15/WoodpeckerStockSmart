// components/Header.jsx
'use client';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import BudgetModal from './BudgetModal'; // Import the modal component
import { db } from '@/utils/db';
import { Inventory } from '@/utils/schema';
import { eq } from 'drizzle-orm';

const Header = ({invetoryId}) => {
    const path = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        console.log(path);
    }, [path]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    const handleSaveBudget = async (budget) => {
        console.log('New Budget:', budget);
    
        if (budget) {
            try {
                // Update the budget in the database
                const result = await db.update(Inventory)
                    .set({ budget: parseFloat(budget) }) // Ensure budget is a number
                    .where(eq(Inventory.id, invetoryId)); // Correctly use inventoryId
    
                console.log('Budget updated successfully:', result);
            } catch (error) {
                console.error('Error updating budget:', error);
            }
        } else {
            console.warn('No budget provided');
        }
    };
    

    return (
        <div className='flex p-4 px-10 items-center justify-between bg-secondary shadow-md'>
            <div className=''>
                <div
                    className='font-semibold rounded-lg border shadow-sm px-10 py-3 w-full h-full bg-slate-100 cursor-pointer'
                    onClick={handleOpenModal} // Open modal on click
                >
                    Add Budget
                </div>
            </div>
            <div className="">
                <h1 className='text-lg font-semibold'>StockSmart</h1>
            </div>
            <UserButton />
            <BudgetModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveBudget}
            />
        </div>
    );
};

export default Header;
