const Home = () => {
    // Other state variables and functions...
  
    // State variable to hold the edited item data
    const [editFormData, setEditFormData] = useState({
      category: '',
      item_name: '',
      rate: ''
    });
  
    // Function to populate the form fields with item data for editing
    const handleEditItem = (item) => {
      setEditFormData({
        category: item.category,
        item_name: item.items,
        rate: item.rate
      });
    };
  
    // Function to handle form submission for editing
    const handleEditSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/items/${editItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        });
        const data = await response.json();
        console.log('Item updated successfully:', data);
        // Optionally, update the UI or show a success message
      } catch (error) {
        console.error('Error updating item:', error);
        // Optionally, show an error message
      }
    };
  
    return (
      <>
        <div className="row">
          {/* Other components... */}
          <div className='col-md-6 p-5'>
            <h3 className='text-center text-warning bg-primary p-1 card-header border border-warning'>Edit Item Form</h3>
            <form className='border p-3 border-warning' onSubmit={handleEditSubmit}>
              <div className="form-group row">
                <label htmlFor="category" className="col-sm-2 col-form-label">Category</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" id="category" name='category' value={editFormData.category} onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} />
                </div>
              </div>
  
              {/* Similar form fields for item_name and rate... */}
  
              <div className="form-group row">
                <label htmlFor="rate" className="col-sm-2 col-form-label"></label>
                <div className="col-sm-10 d-flex justify-content-end">
                  <input type="submit" className='btn btn-sm btn-primary' value={"Update"} />
                </div>
              </div>
            </form>
          </div>
          {/* Other components... */}
        </div>
      </>
    );
  };
  
  export default Home;
  