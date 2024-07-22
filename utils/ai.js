// pages/api/predict.js

import axios from 'axios';

export default async function handler(req, res) {
  const { productList, budget } = req.body;

  const prompt = generatePrompt(productList, budget);

  const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
    prompt: prompt,
    max_tokens: 150,
    n: 1,
    stop: null,
    temperature: 0.7,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  res.status(200).json({ result: response.data.choices[0].text });
}

function generatePrompt(productList, budget) {
  let prompt = `I need to predict the amount of stock to purchase for each product to maximize profit. Here is the list of products with their buying prices, stock sold last month, and the overall budget for the inventory. Please provide the optimal stock quantities to purchase for each product within the given budget.\n\n`;

  productList.forEach(product => {
    prompt += `Product: ${product.name}, Buying Price: $${product.buyingPrice}, Sold Last Month: ${product.soldLastMonth} units\n`;
  });

  prompt += `\nOverall Budget: $${budget}\n\nConstraints:\n- The total cost of purchasing the stock for all products should not exceed the given budget.\n- The goal is to maximize profit by considering the demand indicated by the stock sold last month.\n\nCalculations needed:\n1. For each product, calculate the optimal stock quantity to purchase based on its buying price and the demand from last month.\n2. Ensure the total purchasing cost stays within the overall budget.\n3. Provide the recommended stock quantities for each product in a format like this:\n\nRecommendations:\n- Apple: [Optimal Stock Quantity] units\n- Banana: [Optimal Stock Quantity] units\n- Orange: [Optimal Stock Quantity] units\n\nUse the following example data to illustrate the process:\n\nExample:\nProduct: Apple, Buying Price: $1, Sold Last Month: 100 units\nCalculation: If the budget allows, purchase a higher stock quantity proportionate to the sold units last month to meet potential demand.\n\nOutput Format:\n- Apple: [Optimal Stock Quantity] units\n- Banana: [Optimal Stock Quantity] units\n- Orange: [Optimal Stock Quantity] units`;

  return prompt;
}
