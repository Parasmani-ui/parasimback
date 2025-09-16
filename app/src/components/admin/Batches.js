import React, { useState, useEffect } from 'react';
import { post } from '../utils/ServerCall.js';
import globals from '../../context/GlobalVars.js';

const Batches = () => {
  const [items, setItems] = useState([]);
  const [inputBatchName, setInputBatchName] = useState('');
  const [inputClientName, setInputClientName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(globals.ITEMS_PER_PAGE_BATCH_LIST);

  const handleAddItem = () => {
    const newItem = {
      batchName: inputBatchName,
      clientName: inputClientName
    };
    setItems([...items, newItem]);
    setInputBatchName('');
    setInputClientName('');
  };

  const handleDeleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleEditItem = (index) => {
    const newItems = [...items];
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate index of first and last item to be displayed on current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total number of pages based on number of items and items per page
  const totalPages = Math.ceil(items.length / itemsPerPage);

  useEffect(() => {
    async function fetchData() {
      /*
        const data = await post('###pass hooks here', sadmin/batchList');
        if (!data.rc)
        {
            setItems(data);
        }
        */
    }

    fetchData();
  }, []);

  return (
    <div>
      <div>
        <input value={inputBatchName} onChange={(e) => setInputBatchName(e.target.value)} placeholder="Batch Name" />
        <input value={inputClientName} onChange={(e) => setInputClientName(e.target.value)} placeholder="Client Name" />
        <button onClick={handleAddItem}>Add item</button>
      </div>
      <ul>
        {currentItems.map((item, index) => (
          <li key={index}>
            <div>{item.batchName}</div>
            <div>{item.clientName}</div>
            <button onClick={() => handleEditItem(index)}>Edit</button>
            <button onClick={() => handleDeleteItem(index)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <button key={pageNumber} onClick={() => handlePageChange(pageNumber)}>
            {pageNumber}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Batches;
