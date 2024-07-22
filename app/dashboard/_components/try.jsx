// pages/index.js

import { useState } from 'react';

// Dummy function to simulate AI model
async function generateContent(prompt) {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Dummy response
  return {
    response: {
      text: () => JSON.stringify({
        optimalStock: [
          { product: "Apple", optimalQuantity: 50 },
          { product: "Banana", optimalQuantity: 75 },
          { product: "Orange", optimalQuantity: 60 }
        ]
      })
    }
  };
}

export default function Home() {
  const [productList, setProductList] = useState([
    { name: 'Apple', buyingPrice: 1, soldLastMonth: 100, profit: 0.5 },
    { name: 'Banana', buyingPrice: 0.5, soldLastMonth: 150, profit: 0.3 },
    { name: 'Orange', buyingPrice: 0.8, soldLastMonth: 120, profit: 0.4 }
  ]);
  const [budget, setBudget] = useState(200);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProduct = () => {
    setProductList([...productList, { name: '', buyingPrice: 0, soldLastMonth: 0, profit: 0 }]);
  };

  const handleChange = (index, field, value) => {
    const updatedList = [...productList];
    updatedList[index][field] = value;
    setProductList(updatedList);
  };

  const generatePrompt = (productList, budget) => {
    const inputData = {
      products: productList.map(product => ({
        name: product.name,
        buyingPrice: parseFloat(product.buyingPrice),
        soldLastMonth: parseInt(product.soldLastMonth),
        profit: parseFloat(product.profit)
      })),
      budget: parseFloat(budget)
    };

    return `
    Calculate the optimal stock quantities for the following products within the given budget. The goal is to maximize profit while ensuring a balanced distribution (maximum 30% difference between highest and lowest stock quantities). Consider both sales and profit in your calculations.

    Input data:
    ${JSON.stringify(inputData, null, 2)}

    Please perform the following steps:
    1. Ensure minimum stock of 1 for each product.
    2. Calculate weights based on sales and profit.
    3. Distribute the remaining budget based on these weights.
    4. Adjust weights if the difference between max and min quantities exceeds 30%.
    5. Repeat steps 3-4 until budget is exhausted or balance is achieved.

    Return the result as a JSON object with the following structure:
    {
      "optimalStock": [
        {
          "product": "Product Name",
          "optimalQuantity": number
        },
        // ... (for each product)
      ]
    }

    Provide only the JSON result without any additional explanation.
    `;
  };

  async function handleSubmit() {
    setIsLoading(true);
    const prompt = generatePrompt(productList, budget);

    try {
      const result = await generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonResult = JSON.parse(text);
      setResult(jsonResult.optimalStock);
    } catch (error) {
      console.error('Error generating prediction:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1>Inventory Prediction</h1>
      {productList.map((product, index) => (
        <div key={index}>
          <input 
            type="text" 
            placeholder="Product Name" 
            value={product.name} 
            onChange={(e) => handleChange(index, 'name', e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Buying Price" 
            value={product.buyingPrice} 
            onChange={(e) => handleChange(index, 'buyingPrice', e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Sold Last Month" 
            value={product.soldLastMonth} 
            onChange={(e) => handleChange(index, 'soldLastMonth', e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Profit" 
            value={product.profit} 
            onChange={(e) => handleChange(index, 'profit', e.target.value)} 
          />
        </div>
      ))}
      <button onClick={handleAddProduct}>Add Product</button>
      <input 
        type="number" 
        placeholder="Budget" 
        value={budget} 
        onChange={(e) => setBudget(e.target.value)} 
      />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Predicting...' : 'Predict'}
      </button>
      <div>
        <h2>Prediction Result:</h2>
        {result && (
          <ul>
            {result.map((item, index) => (
              <li key={index}>{item.product}: {item.optimalQuantity} units</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}