import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
const ItemContextPharmacy = createContext();

// Create a provider component
export const ItemProviderPharmacy = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllItemsPharmacy = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL+"/get-all-items-for-pharmacy");
      setItems(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  // Fetch items when the provider mounts
  useEffect(() => {
    fetchAllItemsPharmacy();
  }, []);

  return (
    <ItemContextPharmacy.Provider value={{ items, fetchAllItemsPharmacy }}>
      {children}
    </ItemContextPharmacy.Provider>
  );
};

// Custom hook to use the item context
export const useItemPharmacy = () => {
  const context = useContext(ItemContextPharmacy);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
};