import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1, // Adjusted for more focused output
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 1024, // Adjusted for specific use case
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
];

const chatSession = model.startChat({
    generationConfig,
    safetySettings,
});

export async function generateInventoryPrediction(productList, budget) {
    const InputPrompt = generatePrompt(productList, budget);

    try {
        const result = await chatSession.sendMessage(InputPrompt);

        if (result.response && result.response.candidates && result.response.candidates.length > 0) {
            let text = result.response.candidates[0].content.parts[0].text;
            console.log('Original Text:', text);  // Log for debugging

            // Clean the text
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log('Cleaned Text:', text);  // Log cleaned text

            // Add commas between question and answer if missing
            text = text.replace(/(\d})\s*("answer")/g, '$1,$2');  // Add commas before "answer" if missing
            console.log('Corrected Text:', text);  // Log corrected text

            // Parse the cleaned JSON
            const parsedResult = JSON.parse(text);
            console.log('Parsed Result:', parsedResult);  // Log parsed result

            return parsedResult;
        } else {
            console.error("No candidates in the response.");
            return null;  // Return null or handle appropriately
        }
    } catch (error) {
        console.error("Error sending message:", error);
        return null;  // Return null or handle as needed
    }
}

function generatePrompt(productList, budget) {
    const inputData = {
      products: productList.map(product => ({
        name: product.name,
        buyingPrice: parseFloat(product.buyingPrice),
        soldLastMonth: parseInt(product.soldLastMonth, 10),
        profit: parseFloat(product.profit)
      })),
      budget: parseFloat(budget)
    };
  
    return `
  Calculate the optimal stock quantities for the following products within the given budget. The goal is to maximize profit while ensuring a balanced distribution (maximum 30% difference between highest and lowest stock quantities). Consider both sales and profit in your calculations.
  
  Input data:
  ${JSON.stringify(inputData, null, 2)}
  
  Please perform the following steps:
  1. Ensure minimum stock of 10% for each product.
  2. Calculate weights based on sales and profit.
  3. Distribute the remaining budget based on these weights.
  4. Adjust weights if the difference between max and min quantities exceeds 30%.
  5. Repeat steps 3-4 until budget is exhausted or balance is achieved.
  6. Fine-tune the final distribution to ensure the total cost is as close as possible to the budget without exceeding it.

  
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
  }