const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeAmazonProduct(url) {
    if (!url) return;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract the rating count
        const reviewsCountElement = $('#acrCustomerReviewText');
        let reviewsCountValue = '';

        if (reviewsCountElement.length > 0) {
            reviewsCountValue = reviewsCountElement.text().trim(); // Get the text content
            console.log('Raw reviews count:', reviewsCountValue);

            // Extract just the numeric part from the reviewsCountValue
            reviewsCountValue = reviewsCountValue.replace(/[^\d]/g, '');
            console.log('Cleaned reviews count:', reviewsCountValue);
        } else {
            console.log('Reviews count element not found.');
        }

        // Return only the rating count
        return {
            reviewsCount: parseInt(reviewsCountValue, 10) || 0
        };

    } catch (error) {
        throw new Error(`Failed to scrape the data: ${error.message}`);
    }
}


module.exports = { scrapeAmazonProduct };
