'use client'

import React, { useEffect, useState } from 'react';
import Header from "./_components/Header";
import Footer from './_components/Footer';
import CreditCard from './_components/CreditCard';
import List from './_components/List';
import AddProductModal from './_components/productModal';
import { db } from '@/utils/db';
import { Inventory, Product } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import Home from './_components/try';
import { generateInventoryPrediction } from '@/utils/geminiai';
import { scrapeAmazonProduct } from '@/utils/scraper';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventoryId, setInventoryId] = useState(null);
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [inventoryData, setInventoryData] = useState(null); // State to hold inventory data as an object
  const [refreshKey, setRefreshKey] = useState(0);


  

  useEffect(() => {
    if (email) {
      checkAndAssignInventory(email);
    }
  }, [user]);


  useEffect(() => {
    if (inventoryData) {
      console.log('Inventory Data:', inventoryData);
      console.log(inventoryId)
    }
  }, [inventoryData]);


  const checkAndAssignInventory = async (email) => {
    try {
      const existingInventory = await db.select().from(Inventory).where(eq(Inventory.email, email));
      console.log(existingInventory);
      if (existingInventory.length === 0) {
        const assignedInventory = await assignInventoryToUser(email);
        setInventoryData(assignedInventory); // Store the entire inventory object
        setInventoryId(assignedInventory); // Ensure inventory ID is set
      } else {
        console.log('First: existing inventory found');
        setInventoryData(existingInventory[0]); // Store the existing inventory object
        setInventoryId(existingInventory[0].id); // Ensure inventory ID is set
      }
    } catch (error) {
      console.error('ErrorBackend Frontend checking or assigning inventory:', error);
    }
  };


  const assignInventoryToUser = async (email) => {
    try {
      // Generate a unique inventory ID
      const newInventoryId = uuidv4();
      console.log(email + email);

      // Example logic to assign inventory to a user
      const newInventory = await db.insert(Inventory)
        .values({
          id: newInventoryId,
          budget: '2000',
          lastUpdated: '2024-07-19',
          email: email,
        })
        .returning({ id: Inventory.id }); // Return the entire inserted row
      console.log(newInventory)
      // Return the entire inventory object
    } catch (error) {
      console.error('Error assigning inventory:', error);
      return null;
    }
  };


  const handleAddProductClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleAddProduct = async (formData) => {
    try {
      console.log(inventoryId);
  
      // Ensure inventoryId is set before proceeding
      if (!inventoryId) {
        throw new Error('Inventory ID is not set.');
      }
  
      let invenId = inventoryId;
  
      // Example logic to add product to inventory
      const productId = uuidv4();
  
      // Insert the product
      const [result] = await db.insert(Product)
        .values({
          id: productId,
          name: formData.get('productName'), // Retrieve product name from formData
          price: formData.get('price'), // Retrieve price from formData
          lastSoldPrice: formData.get('lastSoldPrice'), // Retrieve lastSoldPrice from formData
          lastMonthStock: formData.get('soldLastMonth'), // Retrieve soldLastMonth from formData
          inventoryId: invenId, // Assigning the current inventory ID
          desc: formData.get('otherDetails'), // Retrieve otherDetails from formData
          quantity: formData.get('quantity'),
          understock: formData.get('understock') === 'true', // Convert understock to boolean
          overstock: formData.get('overstock') === 'true', // Convert overstock to boolean
          url: formData.get('url') // Save the URL for fetching the rating later
        })
        .returning(Product.id);
  
      // Extract productId from result
      const insertedProductId = result[0]?.id;
  
      // Set the productId state
      if (insertedProductId) {
        setProductId(insertedProductId);
      }
  
      console.log('Product added successfully:', insertedProductId);
  
      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  

  const fetchRating = async (productId) => {
    try {
      const product = await db.select().from(Product).where(eq(Product.id, productId));

      if (!product || !product.url) {
        throw new Error('Product URL not found.');
      }

      const rating = await scrapeAmazonProduct(product.url);
      console.log('Fetched rating:', rating);

      return rating;
    } catch (error) {
      console.error('Error fetching rating:', error);
      throw error; // Rethrow the error for handling in the caller function
    }
  };



  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const [percentages, setPercentages] = useState({
    overstockedPercentage: 0,
    understockedPercentage: 0,
    totalProfit: 0,
    totalProfitPercentage: 0,
    spentChangePercentage: 0,
    totalSpentThisMonth: 0,
    totalSpentLastMonth: 0,
  });




  const handlePredictInventory = async () => {
    setIsPredicting(true);
    try {
      // Fetch products for the current inventory
      const products = await db.select().from(Product).where(eq(Product.inventoryId, inventoryId));
      if (products) {
        console.log('daijosdaiosjdaois');
        calculateInventoryPercentages(products);
      }

      // Format products for the prediction function
      const formattedProducts = products.map(product => ({
        name: product.name,
        buyingPrice: parseFloat(product.price),
        soldLastMonth: parseInt(product.lastMonthStock),
        profit: parseFloat(product.lastSoldPrice) - parseFloat(product.price)
      }));

      // Get the budget from inventoryData
      const budget = parseFloat(inventoryData.budget);
      console.log(budget);
      console.log(formattedProducts);

      // Generate prediction
      const result = await generateInventoryPrediction(formattedProducts, budget);
      // Ensure the result is logged
      console.log('Prediction Result:', result);
      setPredictionResult(result);

      // Update suggested stock in the database
      if (result && result.optimalStock) {
        for (let item of result.optimalStock) {
          console.log(item);  // Log item to ensure data is correct

          // Fetch the specific product
          const [productToUpdate] = await db.select().from(Product)
            .where(eq(Product.name, item.product))
            .where(eq(Product.inventoryId, inventoryId));

          // Update the suggested stock
          if (productToUpdate) {
            await db.update(Product)
              .set({ suggestedStock: item.optimalQuantity.toString() })
              .where(eq(Product.id, productToUpdate.id));
          }
        }
        console.log('Database updated successfully');
      }

      // Trigger re-render by updating refreshKey
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error("Error predicting inventory:", error);
    } finally {
      setIsPredicting(false);
    }
  };


  const calculateInventoryPercentages = (products) => {
    const total = products.length;
    const overstocked = products.filter(p => p.overstock === true).length;
    const understocked = products.filter(p => p.understock === true).length;

    const overstockedPercentage = total > 0 ? (overstocked / total) * 100 : 0;
    const understockedPercentage = total > 0 ? (understocked / total) * 100 : 0;

    const totalCostLastMonth = products.reduce((acc, product) => {
      return acc + (parseFloat(product.lastSoldPrice || 0) * parseInt(product.lastMonthStock || 0));
    }, 0);

    const totalRevenueThisMonth = products.reduce((acc, product) => {
      return acc + (parseFloat(product.price || 0) * parseInt(product.quantity || 0));
    }, 0);

    const totalCostThisMonth = products.reduce((acc, product) => {
      return acc + (parseFloat(product.lastSoldPrice || 0) * parseInt(product.quantity || 0));
    }, 0);

    const totalProfit = totalRevenueThisMonth - totalCostThisMonth;

    const totalProfitPercentage = totalRevenueThisMonth > 0 ? (totalProfit / totalRevenueThisMonth) * 100 : 0;
    const spentChangePercentage = totalCostLastMonth > 0 ? ((totalCostThisMonth - totalCostLastMonth) / totalCostLastMonth) * 100 : 0;

    setPercentages({
      overstockedPercentage: overstockedPercentage.toFixed(2),
      understockedPercentage: understockedPercentage.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      totalProfitPercentage: totalProfitPercentage.toFixed(2),
      spentChangePercentage: spentChangePercentage.toFixed(2),
      totalSpentThisMonth: totalCostThisMonth.toFixed(2),
      totalSpentLastMonth: totalCostLastMonth.toFixed(2),
    });

    console.log('Total profit is ' + totalProfit);
    console.log(`Total Products: ${total}`);
    console.log(`Overstocked Products: ${overstocked} (${overstockedPercentage.toFixed(2)}%)`);
    console.log(`Understocked Products: ${understocked} (${understockedPercentage.toFixed(2)}%)`);
  };




  return (
    <div className='flex flex-col justify-between h-screen'>
      <div>
        <Header
          invetoryId={inventoryId}
        />
        <div className="flex flex-col bg-slate-50 bg-gradient-to-l from-green-500/10 via-red-500/5 to-red-500/10">
          <div className="pl-40 pt-5 flex flex-row gap-5">
            <h1 className='text-4xl text-black font-bold'>Overview</h1>
            <div
              className="border-2 bg-green-500 flex justify-center items-center p-2 rounded-lg cursor-pointer"
              onClick={handleAddProductClick}
            >
              <h1 className="font-semibold text-white text-sm">+ Add Product</h1>
            </div>
          </div>
          <section className="flex-1 w-screen flex items-center justify-center py-4">
            {inventoryData ? (
              <CreditCard
                budget={inventoryData.budget}
                cardNumber="1234 5678 9012 3456"
                cardHolder="John Doe"
                expiryDate="12/23"
                bankName="Bank of React"
              />
            ) : (
              <CreditCard
                budget='0'
                cardNumber="1234 5678 9012 3456"
                cardHolder="John Doe"
                expiryDate="12/23"
                bankName="Bank of React"
              />
            )}
          </section>
          <section className="flex-1 flex flex-row justify-evenly px-20 py-5 border-t">
            <div>
              <div className="flex flex-col justify-start">
                <h1 className='font-semibold text-sm'>Profit</h1>
                <div className="flex flex-row gap-1 justify-center items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-indian-rupee"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></svg>
                  <h1 className='text-xl font-bold'>{percentages.totalProfit}</h1>
                  <p className='mb-3 text-green-500 font-semibold text-sm flex flex-row justify-center items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-move-up"><path d="M8 6L12 2L16 6" /><path d="M12 2V22" /></svg>
                    {percentages.totalProfitPercentage}
                  </p>
                </div>
                <p className='text-sm text-slate-400'>Compared to last month</p>
              </div>
            </div>
            <div>
              <div className="flex flex-col justify-start">
                <h1 className='font-medium text-sm'>
                  {percentages.understockedPercentage > percentages.overstockedPercentage ? 'Understock' : 'Overstock'}
                </h1>
                <div className="flex flex-row gap-1 justify-center items-center">
                  <h1 className='text-xl font-bold'>
                    {percentages.understockedPercentage > percentages.overstockedPercentage
                      ? percentages.understockedPercentage
                      : percentages.overstockedPercentage
                    }
                    %
                  </h1>
                </div>
                <p className='text-sm text-slate-400'>Of inventory </p>
              </div>
            </div>
            <div>
              <div className="flex flex-col justify-start">
                <h1 className='font-medium text-sm'>Expenditure</h1>
                <div className="flex flex-row gap-1 justify-center items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-indian-rupee"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></svg>
                  <h1 className='text-xl font-bold'>{percentages.totalSpentThisMonth}</h1>
                  <p className='mb-3 text-green-500 font-semibold text-sm flex flex-row justify-center items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-move-up"><path d="M8 6L12 2L16 6" /><path d="M12 2V22" /></svg>
                    {percentages.spentChangePercentage}
                  </p>
                </div>
                <p className='text-sm text-slate-400'>Compared to last month</p>
              </div>
            </div>
          </section>
          <section className="bg-white py-10 px-20">
            <div className="flex flex-row gap-10 ">
              <h1 className='text-3xl font-semibold text-gray-600'>Product List</h1>
              <button
                onClick={handlePredictInventory}
                disabled={isPredicting}
                className="bg-green-500 text-white px-2 rounded text-sm"
              >
                {isPredicting ? 'Predicting...' : 'Predict Inventory'}
              </button>
            </div>
            <List
              key={refreshKey}
              inventoryId={inventoryId}
            />
          </section>
        </div>
      </div>

      <Footer />
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        inventoryId={inventoryId}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}

export default Dashboard;
