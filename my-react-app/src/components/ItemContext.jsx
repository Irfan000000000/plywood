import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
const ItemContext = createContext();

// Create a provider component
export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllItems = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL+"/get-all-items");
      setItems(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  // Fetch items when the provider mounts
  useEffect(() => {
    fetchAllItems();
  }, []);

  return (
    <ItemContext.Provider value={{ items, fetchAllItems }}>
      {children}
    </ItemContext.Provider>
  );
};

// Custom hook to use the item context
export const useItems = () => {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
};