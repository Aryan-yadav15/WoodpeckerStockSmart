import React, { useState } from 'react';

const AddProductModal = ({ isOpen, onClose, inventoryId, onAddProduct }) => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [lastPrice, setLastPrice] = useState('');
  const [soldLastMonth, setSoldLastMonth] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState(null);
  const [otherDetails, setOtherDetails] = useState('');
  const [stockStatus, setStockStatus] = useState('perfect');
  const [url, setUrl] = useState('');

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inventoryId) {
      console.error('Inventory ID is not set.');
      return;
    }
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('price', price);
    formData.append('lastSoldPrice', lastPrice);
    formData.append('soldLastMonth', soldLastMonth);
    formData.append('image', image);
    formData.append('otherDetails', otherDetails);
    formData.append('inventoryId', inventoryId);
    formData.append('quantity', quantity);

    // Convert stock status to boolean values
    formData.append('understock', stockStatus === 'under');
    formData.append('overstock', stockStatus === 'over');
    formData.append('url', url)
    onAddProduct(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-row gap-10">
            <div className="mb-4 flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productName">
                Product Name
              </label>
              <input
                id="productName"
                type="text"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4 flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>
          <div className="flex flex-row gap-10">
            <div className="mb-4 flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastPrice">
                Last Price
              </label>
              <input
                id="lastPrice"
                type="number"
                placeholder="Last Price"
                value={lastPrice}
                onChange={(e) => setLastPrice(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4 flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="soldLastMonth">
                Sold Last Month
              </label>
              <input
                id="soldLastMonth"
                type="number"
                placeholder="Sold Last Month"
                value={soldLastMonth}
                onChange={(e) => setSoldLastMonth(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>
          <div className="flex flex-row gap-10">
            <div className="mb-4 flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stockStatus">
                Stock Status
              </label>
              <select
                id="stockStatus"
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="perfect">Perfect Stock</option>
                <option value="under">Understock</option>
                <option value="over">Overstock</option>
              </select>
            </div>
            <div className="mb-4 flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                Current Quatity
              </label>
              <input
                id="quantity"
                placeholder="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>
          <div className="flex flex-row gap-10">
            <div className="mb-4 flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otherDetails">
                Other Details
              </label>
              <textarea
                id="otherDetails"
                placeholder="Other important details"
                value={otherDetails}
                onChange={(e) => setOtherDetails(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>

            <div className="mb-4 flex-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                Product URL
              </label>
              <textarea
                id="url"
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
