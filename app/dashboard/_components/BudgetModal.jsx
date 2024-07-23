// components/BudgetModal.jsx
import React, { useState } from 'react';

const BudgetModal = ({ isOpen, onClose, onSave }) => {
    const [budget, setBudget] = useState('');

    const handleSave = () => {
        if (budget) {
            onSave(budget);
            setBudget('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-[60vw]'>
                <h2 className='text-2xl font-semibold mb-4'>Update Budget</h2>
                <input
                    type='number'
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className='border p-2 rounded w-full'
                    placeholder='Enter new budget'
                />
                <div className='mt-4 flex justify-end gap-4'>
                    <button onClick={onClose} className='bg-gray-300 p-2 rounded'>Cancel</button>
                    <button onClick={handleSave} className='bg-green-500 text-white p-2 rounded'>Save</button>
                </div>
            </div>
        </div>
    );
};

export default BudgetModal;
