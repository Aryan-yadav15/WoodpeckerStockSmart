// src/CreditCard.js
import React from 'react';

const CreditCard = ({ cardNumber, cardHolder, expiryDate, bankName }) => {
  return (
    <div className="w-[350px] bg-gradient-to-r from-gray-900 to-gray-600 rounded-xl text-white p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold">INR</span>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
          alt="Visa Logo"
          className="w-10"
        />
      </div>
      <div className="mb-4">
        <span className="text-xs">Budget</span>
        <div className="text-3xl font-semibold">12,230</div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs">Owner name</span>
          <div className="text-md font-semibold">Aryan Yadav</div>
        </div>
        <div>
          <span className="text-xs">Updated</span>
          <div className="text-md font-semibold">{expiryDate}</div>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
