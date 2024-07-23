'use client';
import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { Product } from '@/utils/schema';
import { eq } from 'drizzle-orm';

const List = ({ inventoryId }) => {
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    if (inventoryId) {
      listProducts();
    }
  }, [inventoryId]);

  useEffect(() => {
    if (productList.length > 0) {
      calculateInventoryPercentages(productList);
    }
  }, [productList]);

  const listProducts = async () => {
    try {
      const list = await db.select()
        .from(Product)
        .where(eq(Product.inventoryId, inventoryId));
      setProductList(list);
    } catch (error) {
      console.error('Error listing products:', error);
    }
  };

  const calculateInventoryPercentages = (products) => {
    const total = products.length;
    const overstocked = products.filter(p => p.overstock === true).length;
    const understocked = products.filter(p => p.understock === true).length;

    const overstockedPercentage = total > 0 ? (overstocked / total) * 100 : 0;
    const understockedPercentage = total > 0 ? (understocked / total) * 100 : 0;

    console.log(`Total Products: ${total}`);
    console.log(`Overstocked Products: ${overstocked} (${overstockedPercentage.toFixed(2)}%)`);
    console.log(`Understocked Products: ${understocked} (${understockedPercentage.toFixed(2)}%)`);
  };

  const getStatusColor = (product) => {
    if (product.overstock) return 'bg-red-500 text-white'; // Red for Overstocked
    if (product.understock) return 'bg-blue-500 text-white'; // Yellow for Understocked
    return 'bg-green-500 text-white'; // Green for Perfect
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'; // Tailwind CSS classes
  };

  return (
    <div className='mt-10'>
      <div className="bg-gray-800 flex flex-row justify-between px-2 rounded-lg w-full ">
        <h2 className="text-white text-md p-2">Name</h2>
        <h2 className="text-white text-md p-2">Price</h2>
        <h2 className="text-white text-md p-2">Quantity</h2>
        <h2 className="text-white text-md p-2">Suggested Stock</h2>
        <h2 className="text-white text-md p-2">Status</h2>
        <h2 className="text-white text-md p-2">Profit Per Unit</h2>
      </div>
      <ul>
        {productList.map((product) => {
          // Calculate profit per unit
          const lastMonthPrice = parseFloat(product.lastSoldPrice) || 0;
          const currentPrice = parseFloat(product.price) || 0;
          const profitPerUnit = currentPrice - lastMonthPrice;

          return (
            <li key={product.id} className='flex flex-row justify-between items-center p-2 bg-slate-100 mt-3 rounded-lg shadow-lg'>
              <p className='flex-1 text-center'>{product.name}</p>
              <p className='flex-1 text-center'>{product.price}</p>
              <p className='flex-1 text-center'>{product.quantity}</p>
              <p className='flex-1 text-center'>{product.suggestedStock}</p>
              <div className="flex-1 flex justify-center items-center">
                <p className={`px-2 w-full rounded ${getStatusColor(product)} text-center`}>
                  {product.overstock
                    ? 'Overstocked'
                    : product.understock
                      ? 'Understocked'
                      : 'Perfect'}
                </p>
              </div>
              <p className={`flex-1 text-center ${getProfitColor(profitPerUnit)}`}>
                {profitPerUnit.toFixed(2)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default List;
