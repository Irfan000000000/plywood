import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Autosuggest from 'react-autosuggest';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValid, format } from "date-fns";


function UpdateRates() {
  // Data and pagination states
  const [data, setData] = useState([]);
  const [suggestedData, getSuggestedData] = useState([]);

  const [hit, setHit] = useState('');


  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState("");
  const [getCategories, setCategories] = useState([]);
  const [searchInvoice, setSearchInvoice] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
      const [getItems, setItems] = useState([]);

      const [fromDatePicker, setFromDatePicker] = useState(null);
      const [toDatePicker, setToDatePicker] = useState(null);

  //  const [updateMedicine, setUpdateMedicine] = useState({
  //     item: "",
  //     item_name: "",
  //   });


     // Form state – using empty strings for required fields
  const [editFormData, setEditFormData] = useState({
    item_id:'',
    item_name:"",
    price: 0,
    discount: 0,
    price_after_discount: 0,
    from_date:'',
    to_date:''
  });

    const handleItemChange = (selectedOption) => {
      const itemDetails = getItems.find(item => item.id === selectedOption.value);
      
      setSelectedItem(selectedOption);
      
      setEditFormData({
        ...editFormData,
        item_id: selectedOption.value,
        item_name: selectedOption.label
      });
    };
  

  // Report state (for later use)
  const [report, getAllReports] = useState({
    from_date: '',
    to_date: '',
    report_type: ''
  });

  // NEW: Track whether the user has attempted to submit the form
  const [submitted, setSubmitted] = useState(false);

 

  // For items per page
  const [totalItem, setTotalItemGet] = useState(10);

  // ---------------------------
  // Autosuggest configuration
  // ---------------------------
  // Example list of medicine names for suggestions
  const suggestionsList = [
    { name: "Aspirin" },
    { name: "Tylenol" },
    { name: "Ibuprofen" },
    { name: "Amoxicillin" },
    { name: "Penicillin" },
    { name: "Metformin" }
  ];

  // State for autosuggest suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Filter suggestions based on input value
  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0
      ? []
      : suggestedData.filter(suggestion =>
          suggestion.name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  // Return the suggestion value
  const getSuggestionValue = suggestion => suggestion.name;

  // How to render each suggestion
  const renderSuggestion = suggestion => <div>{suggestion.name}</div>;

  // When suggestions are needed (typing)
  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  // When suggestions should be cleared
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  // Input props for Autosuggest with conditional validation styling
  const inputProps = {
    placeholder: "Enter medicine name",
    value: editFormData.item_name,
    onChange: (e, { newValue }) =>
      setEditFormData({ ...editFormData, item_name: newValue }),
    // Only add 'is-invalid' if the form has been submitted and the field is empty
    className: `form-control ${submitted && !editFormData.item_name ? 'is-invalid' : ''}`,
    id: "item_name",
    name: "item_name"
  };

  // ---------------------------
  // End of Autosuggest configuration
  // ---------------------------

  // Fetch data from server
  // const fetchData = () => {
  //   axios.get(process.env.REACT_APP_API_URL+"/items", {
  //     params: {
  //       page: currentPage,
  //       limit: totalItem,
  //       getSearch: searchInvoice
  //     }
  //   })
  //     .then(res => {
  //       setData(res.data.results);
  //       setTotalCount(0);
  //       setTotalPages(res.data.totalPages);
  //       setLoading(false);
  //     })
  //     .catch(err => console.log(err));
  // };

  // useEffect(() => {
  //   fetchSuggestionList();
  // }, []);



  useEffect(() => {
    const fetchItems = () => {
      axios.get(process.env.REACT_APP_API_URL+"/get-all-items")
        .then(res => {
          setItems(res.data.results);

        })
        .catch(err => console.log(err));
    };

    fetchItems();
  }, []);




  // function fetchSuggestionList(){
  //   axios.get(process.env.REACT_APP_API_URL+"/get-all-items-for-suggestion", {
  //     params: {
  //       page: currentPage,
  //       limit: totalItem
  //     }
  //   })
  //     .then(res => {
  //       getSuggestedData(res.data.results);
  //     })
  //     .catch(err => console.log(err));
  // }


  // Handle page change for pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // useEffect(() => {
  //   fetchData();
  // }, [currentPage, totalItem, searchInvoice]);

  const handleTotalItemChange = (event) => {
    const newValue = event.target.value;
    if (event.target.id === "search-invoice") {
      if (event.key === "Enter") {
        setSearchInvoice(newValue);
        console.log("Search started with: ", newValue);
      }
    } else {
      setTotalItemGet(newValue);
    }
  };

  const calculate = () => {
    const {price, discount } = editFormData;
    const calculate_discount = price / 100 * discount;
    setEditFormData({
      ...editFormData,
      price_after_discount : price - calculate_discount
    });
  };

  // Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    let confirm_rates = window.confirm("Are you sure! Update Rates of Medicine");
    if(!confirm_rates){
      return;
    }
    // Mark the form as submitted so validation errors appear
    setSubmitted(true);

    // Validate required fields (adjust these as needed)
    console.log(editFormData);

      if (
        !editFormData.item_name ||  // Check for empty string, null, undefined
        !editFormData.item_id || 
        !editFormData.price || 
        editFormData.discount == null ||  // Check if discount is null or undefined (allow 0 as valid)
        !editFormData.price_after_discount
      ) {
        toast.error("Please fill all required fields.");
        return;
      }


      axios.put(`${process.env.REACT_APP_API_URL}/update-item-rate-datewise/${editFormData.item_id}`, editFormData)
        .then(response => {
          console.log('Data updated successfully:', response.data);
          toast.success('Data updated successfully!');
          // Reset submitted state after success
          setSubmitted(false);
          setEditFormData({
            ...editFormData,
            item_id:'',
            item_name:"",
            price: 0,
            discount: 0,
            price_after_discount: 0,
          });
          // fetchData();
          // fetchSuggestionList();
        })
        .catch(error => {
          console.error('Error updating data:', error);
          toast.error(error.response.data.error);
        });
    
  };

  const editItem = (item_id_get) => {
    const itemId = item_id_get;
    axios.get(`${process.env.REACT_APP_API_URL}/item-get/${itemId}`)
      .then(response => {
        const { id, items, price, discount, rack_no, formula, unit_type, gst, manufacturer, medicine_type } = response.data.results[0];
        setEditFormData({
          manufacturer: manufacturer || '',
          item_name: items || '',
          price: price || '',
          discount: discount !== null && discount !== undefined ? discount : '',
          gst: gst || '',
          rack_no: rack_no || '',
          formula: formula || '',
          unitType: unit_type || '',
          medicine_type: medicine_type || '',
          hidden_id: id || ''
        });
        // Reset submitted so errors don't show during edit
        setSubmitted(false);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  // const deleteItem = (item_id) => {
  //   axios.delete(`${process.env.REACT_APP_API_URL}/delete-item/${item_id}`)
  //     .then(response => {
  //       console.log('Item deleted successfully:', response.data);
  //       fetchData();
  //     })
  //     .catch(error => {
  //       console.error('Error deleting item:', error);
  //     });
  // };


  const handleDateChange = (date, field) => {
        if (!date || !isValid(date)) return; // Ensure valid date selection
    
        // Set the state based on the field
        if (field === "from_date") {
          setFromDatePicker(date);
        } else {
          setToDatePicker(date);
        }
    
        // Format for backend (YYYY-MM-DD)
        const backendDate = format(date, "yyyy-MM-dd");
    
        // Send to backend
        setEditFormData({ ...editFormData, [field]: backendDate });
      };

  return (
    <>
      <div className="d-flex">
        <div className='col-md-12 p-2'>
          <h5 className='text-warning bg-primary p-2 card-header border'>
            <i className="fas fa-first-aid"></i> Update Medicine Rate
          </h5>
          <form className='border p-3' onSubmit={handleSubmit}>
           
            
          <div className="form-group row">
          <label htmlFor="discount" className="col-sm-2 col-form-label">Dates</label>
                <div  className="d-flex col-md-10">
                <DatePicker
                  selected={fromDatePicker}
                  onChange={(date) => handleDateChange(date, "from_date")}
                  dateFormat="dd-MM-yyyy" // Strict display format
                  className="form-control"
                  placeholderText="From Date"
                />
              {/* </div> */}

              {/* <div  className="col-md-5"> */}
                <DatePicker
                  selected={toDatePicker}
                  onChange={(date) => handleDateChange(date, "to_date")}
                  dateFormat="dd-MM-yyyy" // Strict display format
                  className="form-control ml-5"
                  placeholderText="To Date"
                />
              </div>
            </div>


            <div className="form-group row">
            <label htmlFor="price" className="col-sm-2 col-form-label">Medicine</label>
            <div className="col-sm-10">
            <Select
                    id="item"
                    name="item"
                    value={selectedItem}
                    options={getItems.map(item => ({
                      value: item.id,
                      label: `${item.items} (${item.manufacturer})`,
                    }))}
                    onChange={handleItemChange}
                    placeholder="Select Medicine"
                  />
              </div>
            </div>
            

         
            <div className="form-group row">
              <label htmlFor="discount" className="col-sm-2 col-form-label">Rate</label>
              <div className="col-sm-10">
                <input
                  type="number"
                  className="form-control"
                  onKeyUp={calculate}
                  id="price"
                  name="price"
                  value={editFormData.price || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                />
              </div>
            </div>


            <div className="form-group row">
              <label htmlFor="discount" className="col-sm-2 col-form-label">Discount</label>
              <div className="col-sm-10">
                <input
                  type="number"
                  className="form-control"
                  onKeyUp={calculate}
                  id="discount"
                  name="discount"
                  value={editFormData.discount || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, discount: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group row">
              <label htmlFor="discount" className="col-sm-2 col-form-label">Rate.After(Disc)</label>
              <div className="col-sm-10">
                <input
                  type="number"
                  className="form-control"
                  // onKeyUp={calculate}
                  id="price_after_discount"
                  name="price_after_discount"
                  value={editFormData.price_after_discount || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, price_after_discount: e.target.value })}
                />
              </div>
            </div>

           
           
          
            {/* Submit Button */}
            <div className="form-group row">
              <div className="col-sm-10 offset-sm-2 d-flex justify-content-end">
                <input
                  type="submit"
                  className="btn btn-sm btn-primary"
                  value="Update"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default UpdateRates;
