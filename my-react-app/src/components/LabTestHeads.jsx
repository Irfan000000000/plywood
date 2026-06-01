// import React, { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { useAuth } from "./AuthContext";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Select from "react-select";

// function CreateTimeTable() {
//   const defaultRow = {
//     id: "",
//     subject: "",
//     teacher: "",
//     timeFrom: "",
//     timeTo: "",
//     roomNo: "",
//     campus_id: "",
//     session_id: "",
//   };

//   const { user } = useAuth();
//   const [rows, setRows] = useState([{ ...defaultRow }]);

//   const [timeTableData, setTimeTableData] = useState([]);

//   const [teachers, setTeachers] = useState([]);

//   const [subjects, setSubjects] = useState([]);

//   // const [showStruckOffSummary, setStruckOffSummary] = useState(false);

//   const [showData, setShowData] = useState(false);

//   const initialFormData = {
//     lab_test_id: "",
//     teacher_id_get: "",
//   };

//   const [editFormData, setEditFormData] = useState(initialFormData);
//   const [getLabTest, setLabTest] = useState([]);

//   const handleChange = (index, field, value) => {
//     const updated = [...rows];
//     updated[index][field] = value;
//     setRows(updated);
//   };

//   const addRow = () => setRows([...rows, { ...defaultRow }]);

//   const deleteRow = (index) => {
//     const updated = rows.filter((_, i) => i !== index);
//     setRows(updated);
//   };

//   const deleteTimeTableRowAlready = (id, index) => {
//     var confirm_delete = window.confirm(
//       "Are you sure you want to delete this timetable entry?"
//     );
//     if (confirm_delete) {
//       axios
//         .get(
//           process.env.REACT_APP_API_URL +
//             `/delete-lab-test-heads/${id}`
//         )
//         .then((response) => {
//           // Handle success response
//           console.log("Deleted Successfully:", response.data);
//           toast.success("Deleted Successfully!");
//           // Remove the row from the state after successful deletion
//           const updatedRows = [...rows];
//           updatedRows.splice(index, 1); // Removes the row at the specified index
//           setRows(updatedRows); // Update the rows state
//         })
//         .catch((error) => {
//           // Handle error response
//           console.error("Error deleting:", error);
//           toast.error("Error deleting timetable!");
//         });
//     }
//   };

//   const viewTimeTable = () => {
//     if (
//       editFormData.teacher_id_get !== "" &&
//       editFormData.class_id !== "" &&
//       editFormData.section_id !== ""
//     ) {
//       // start from view class wise time table
//     }

//     axios
//       .get(`${process.env.REACT_APP_API_URL}/view-timetable`, {
//         params: {
//           // Axios automatically formats this as query params
//           class_id: editFormData.class_id, // optional
//           section_id: editFormData.section_id, // optional
//           shift: editFormData.shift, // required
//           campus_id: user.user.campus_id, // required
//           teacher_id_get: editFormData.teacher_id_get, // optional
//         },
//       })
//       .then((response) => {
//         // Handle success response
//         setTimeTableData(response.data.results); //
//         setShowData(true);
//         // console.log("Timetable fetched successfully:", response.data.results);
//         // You can do something with the response data here, like updating the state to display the timetable
//       })
//       .catch((error) => {
//         // Handle error response
//         console.error("Error fetching timetable:", error);
//         toast.error("Error fetching timetable!"); // You can use toast to show an error message to the user
//       });
//   };

 

//   const moveRow = (index, direction) => {
//     const newRows = [...rows]; // Create a shallow copy of the rows
//     const newIndex = index + direction; // Calculate the new index

//     // Ensure the new index is within bounds of the array
//     if (newIndex < 0 || newIndex >= newRows.length) return;

//     // Swap the rows
//     const temp = newRows[newIndex];
//     newRows[newIndex] = newRows[index];
//     newRows[index] = temp;

//     // Update the state with the new row order
//     setRows(newRows);
//   };

//   // const [activeDay, setActiveDay] = useState("Monday");

//   const handleSave = async () => {
//     const enrichedRows = rows.map((row, index) => ({
//       ...row,
//       lab_test_id: editFormData.lab_test_id,
//       period: index + 1,
//     }));

//     console.log(enrichedRows);

//     try {
//       const response = await axios.post(
//         process.env.REACT_APP_API_URL + "/bulk-insert-lab-test-heads",
//         enrichedRows,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       toast.success("Data Inserted successfully!");
//     } catch (error) {
//       if (error.response?.data?.error) {
//         toast.error(error.response.data.error);
//       } else {
//         toast.error("An error occurred");
//       }
//     }
//   };

//   useEffect(() => {
//     const fetchTeachers = (campus_id) => {
//       axios
//         .get(process.env.REACT_APP_API_URL + `/get-teachers/${campus_id}`)
//         .then((res) => {
//           // console.log(res.data.results);
//           setTeachers(res.data.results);
//         })
//         .catch((err) => console.log(err));
//     };

//     // Ensure user.campus_id is defined before calling fetchClasses
//     if (user && user.user.campus_id) {
//       fetchTeachers(user.user.campus_id);
//     }
//   }, [user]); // Dependencies array to re-run the effect when user changes

//   useEffect(() => {
//     const fetchTimeTable = () => {
//       axios
//         .get(
//           process.env.REACT_APP_API_URL +
//             `/if-lab-test-already-exist/${editFormData.lab_test_id}`
//         )
//         .then((res) => {
//           const fetchedRows = res.data.results.map((item) => ({
//             id: item.id,
//             test_description: item.test_description,
//             ref_range: item.ref_range,
//             unit: item.unit,
//           }));
//           setRows(fetchedRows);
//         })
//         .catch((err) => console.log(err));
//     };

//     if (editFormData.lab_test_id) {
//       fetchTimeTable();
//     }
//   }, [editFormData.lab_test_id]);

//   useEffect(() => {
//     const fetchClasses = () => {
//       axios
//         .get(process.env.REACT_APP_API_URL + `/get-lab-test`)
//         .then((res) => {
//           // console.log(res.data.results)
//           setLabTest(res.data.results);
//         })
//         .catch((err) => console.log(err));
//     };

//     // Ensure user.campus_id is defined before calling fetchClasses
//     fetchClasses();
//   }, []); // Dependencies array to re-run the effect when user changes

//   const findClassLabel = () => {
//     const classObj = getLabTest.find(
//       (lab_test_get) => lab_test_get.id === parseInt(editFormData.lab_test_id)
//     );
//     if (classObj) {
//       return `${classObj.lab_test}`;
//     }
//     return "";
//   };

//   const handleClassChange = (selectedOption) => {
//     const lab_test_get = selectedOption.value;
//     setEditFormData({ ...editFormData, lab_test_id: lab_test_get });
//   };


//   const handleHide = () => {
//     setShowData(false);
//   };

//   return (
//     <div className="d-flex">
//       <div className="col-md-12 p-2">
//         <h5 className="text-warning bg-primary p-2 card-header border">
//           {" "}
//           <i className="fas fa-clock"></i> Add Lab Test Heads
//         </h5>

//         <div className="row mb-4">
//           <div className="col-md-4 mt-4">
//             {/* <label htmlFor="class">Select Class</label> */}
//             <Select
//               options={getLabTest.map((get_lab_test) => ({
//                 value: `${get_lab_test.id}`,
//                 label: `${get_lab_test.lab_test})`,
//               }))}
//               value={
//                 editFormData.lab_test_id
//                   ? {
//                       value: `${editFormData.lab_test_id}`,
//                       label: findClassLabel(),
//                     }
//                   : null
//               }
//               onChange={handleClassChange}
//               placeholder="Select Lab Test"
//             />
//           </div>
//         </div>
//         <div>
          
//           <table className="table table-striped table-bordered mt-3">
//             <thead>
//               <tr>
//                 <th className="text-left">Test Description</th>
//                 <th className="text-left">Reference Range</th>
//                 <th className="text-left">Unit</th>
//                 <th style={{ width: "120px" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rows.map((row, index) => (
//                 <tr key={index}>
//                   <td>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={row.test_description}
//                       onChange={(e) =>
//                         handleChange(index, "test_description", e.target.value)
//                       }
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={row.ref_range}
//                       onChange={(e) =>
//                         handleChange(index, "ref_range", e.target.value)
//                       }
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="unit"
//                       className="form-control"
//                       value={row.unit}
//                       onChange={(e) =>
//                         handleChange(index, "unit", e.target.value)
//                       }
//                     />
//                   </td>
//                   <td>
//                     <div className="d-flex justify-content-center">
//                       <button
//                         className="btn btn-sm btn-outline-secondary mb-1 mr-2"
//                         onClick={() => moveRow(index, -1)} // Move up
//                         disabled={index === 0} // Disable the button if it's the first row
//                         title="Move Up"
//                       >
//                         <i className="fas fa-arrow-up"></i>
//                       </button>
//                       <button
//                         className="btn btn-sm btn-outline-secondary mb-1 mr-2"
//                         onClick={() => moveRow(index, 1)} // Move down
//                         disabled={index === rows.length - 1} // Disable the button if it's the last row
//                         title="Move Down"
//                       >
//                         <i className="fas fa-arrow-down"></i>
//                       </button>

//                       {row.id !== "" ? (
//                         <button
//                           className="btn btn-sm btn-outline-danger mr-2"
//                           onClick={() =>
//                             deleteTimeTableRowAlready(row.id, index)
//                           }
//                           title="Delete"
//                         >
//                           Delete
//                         </button>
//                       ) : (
//                         <button
//                           className="btn btn-sm btn-outline-danger"
//                           onClick={() => deleteRow(index)}
//                           title="Delete"
//                         >
//                           Delete
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="d-flex justify-content-between mt-4">
//             <button className="btn btn-warning" onClick={addRow}>
//               <i className="fas fa-plus me-1"></i> Add Row
//             </button>
//             <button className="btn btn-primary" onClick={handleSave}>
//               <i className="fas fa-save me-1"></i> Save
//             </button>
//           </div>
//         </div>

      
//       </div>
//     </div>
//   );
// }

// export default CreateTimeTable;



import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

function CreateTimeTable() {
  const defaultRow = {
    id: "",
    subject: "",
    teacher: "",
    timeFrom: "",
    timeTo: "",
    roomNo: "",
    campus_id: "",
    session_id: "",
    test_description: "",
    ref_range: "",
    unit: "",
    isHead: false, // Add isHead field to track checkbox state
  };

  const { user } = useAuth();
  const [rows, setRows] = useState([{ ...defaultRow }]);
  const [timeTableData, setTimeTableData] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showData, setShowData] = useState(false);

  const initialFormData = {
    lab_test_id: "",
    teacher_id_get: "",
  };

  const [editFormData, setEditFormData] = useState(initialFormData);
  const [getLabTest, setLabTest] = useState([]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    if (field === "isHead") {
      updated[index][field] = value;
      if (value) {
        // When checkbox is checked, set ref_range and unit to "head"
        updated[index]["ref_range"] = "head";
        updated[index]["unit"] = "head";
      } else {
        // When unchecked, clear the fields
        updated[index]["ref_range"] = "";
        updated[index]["unit"] = "";
      }
    } else {
      updated[index][field] = value;
    }
    setRows(updated);
  };

  const addRow = () => setRows([...rows, { ...defaultRow }]);

  const deleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const deleteTimeTableRowAlready = (id, index) => {
    var confirm_delete = window.confirm(
      "Are you sure you want to delete this timetable entry?"
    );
    if (confirm_delete) {
      axios
        .get(
          process.env.REACT_APP_API_URL +
            `/delete-lab-test-heads/${id}`
        )
        .then((response) => {
          console.log("Deleted Successfully:", response.data);
          toast.success("Deleted Successfully!");
          const updatedRows = [...rows];
          updatedRows.splice(index, 1);
          setRows(updatedRows);
        })
        .catch((error) => {
          console.error("Error deleting:", error);
          toast.error("Error deleting timetable!");
        });
    }
  };

  const viewTimeTable = () => {
    if (
      editFormData.teacher_id_get !== "" &&
      editFormData.class_id !== "" &&
      editFormData.section_id !== ""
    ) {
      // Start from view class wise timetable
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/view-timetable`, {
        params: {
          class_id: editFormData.class_id,
          section_id: editFormData.section_id,
          shift: editFormData.shift,
          campus_id: user.user.campus_id,
          teacher_id_get: editFormData.teacher_id_get,
        },
      })
      .then((response) => {
        setTimeTableData(response.data.results);
        setShowData(true);
      })
      .catch((error) => {
        console.error("Error fetching timetable:", error);
        toast.error("Error fetching timetable!");
      });
  };

  const moveRow = (index, direction) => {
    const newRows = [...rows];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= newRows.length) return;

    const temp = newRows[newIndex];
    newRows[newIndex] = newRows[index];
    newRows[index] = temp;

    setRows(newRows);
  };

  const handleSave = async () => {
    const enrichedRows = rows.map((row, index) => ({
      ...row,
      lab_test_id: editFormData.lab_test_id,
      period: index + 1,
    }));

    console.log(enrichedRows);

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/bulk-insert-lab-test-heads",
        enrichedRows,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Data Inserted successfully!");
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred");
      }
    }
  };

  useEffect(() => {
    const fetchTeachers = (campus_id) => {
      axios
        .get(process.env.REACT_APP_API_URL + `/get-teachers/${campus_id}`)
        .then((res) => {
          setTeachers(res.data.results);
        })
        .catch((err) => console.log(err));
    };

    if (user && user.user.campus_id) {
      fetchTeachers(user.user.campus_id);
    }
  }, [user]);

  useEffect(() => {
    const fetchTimeTable = () => {
      axios
        .get(
          process.env.REACT_APP_API_URL +
            `/if-lab-test-already-exist/${editFormData.lab_test_id}`
        )
        .then((res) => {
          const fetchedRows = res.data.results.map((item) => ({
            id: item.id,
            test_description: item.test_description,
            ref_range: item.ref_range,
            unit: item.unit,
            isHead: false, // Initialize isHead for fetched rows
          }));
          setRows(fetchedRows);
        })
        .catch((err) => console.log(err));
    };

    if (editFormData.lab_test_id) {
      fetchTimeTable();
    }
  }, [editFormData.lab_test_id]);

  useEffect(() => {
    const fetchClasses = () => {
      axios
        .get(process.env.REACT_APP_API_URL + `/get-lab-test`)
        .then((res) => {
          setLabTest(res.data.results);
        })
        .catch((err) => console.log(err));
    };

    fetchClasses();
  }, []);

  const findClassLabel = () => {
    const classObj = getLabTest.find(
      (lab_test_get) => lab_test_get.id === parseInt(editFormData.lab_test_id)
    );
    if (classObj) {
      return `${classObj.lab_test}`;
    }
    return "";
  };

  const handleClassChange = (selectedOption) => {
    const lab_test_get = selectedOption.value;
    setEditFormData({ ...editFormData, lab_test_id: lab_test_get });
  };

  const handleHide = () => {
    setShowData(false);
  };

  return (
    <div className="d-flex">
      <div className="col-md-12 p-2">
        <h5 className="text-warning bg-primary p-2 card-header border">
          <i className="fas fa-clock"></i> Add Lab Test Heads
        </h5>

        <div className="row mb-4">
          <div className="col-md-4 mt-4">
            <Select
              options={getLabTest.map((get_lab_test) => ({
                value: `${get_lab_test.id}`,
                label: `${get_lab_test.lab_test})`,
              }))}
              value={
                editFormData.lab_test_id
                  ? {
                      value: `${editFormData.lab_test_id}`,
                      label: findClassLabel(),
                    }
                  : null
              }
              onChange={handleClassChange}
              placeholder="Select Lab Test"
            />
          </div>
        </div>
        <div>
          <table className="table table-striped table-bordered mt-3">
            <thead>
              <tr>
                <th className="text-center" style={{ width: "5%" }}>Is Head</th>
                <th className="text-left">Test Description</th>
                <th className="text-left">Reference Range</th>
                <th className="text-left">Unit</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={row.isHead}
                      onChange={(e) =>
                        handleChange(index, "isHead", e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={row.test_description}
                      onChange={(e) =>
                        handleChange(index, "test_description", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={row.ref_range}
                      onChange={(e) =>
                        handleChange(index, "ref_range", e.target.value)
                      }
                      disabled={row.isHead} // Disable when isHead is true
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={row.unit}
                      onChange={(e) =>
                        handleChange(index, "unit", e.target.value)
                      }
                      disabled={row.isHead} // Disable when isHead is true
                    />
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-sm btn-outline-secondary mb-1 mr-2"
                        onClick={() => moveRow(index, -1)}
                        disabled={index === 0}
                        title="Move Up"
                      >
                        <i className="fas fa-arrow-up"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary mb-1 mr-2"
                        onClick={() => moveRow(index, 1)}
                        disabled={index === rows.length - 1}
                        title="Move Down"
                      >
                        <i className="fas fa-arrow-down"></i>
                      </button>

                      {row.id !== "" ? (
                        <button
                          className="btn btn-sm btn-outline-danger mr-2"
                          onClick={() =>
                            deleteTimeTableRowAlready(row.id, index)
                          }
                          title="Delete"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteRow(index)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-warning" onClick={addRow}>
              <i className="fas fa-plus me-1"></i> Add Row
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <i className="fas fa-save me-1"></i> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTimeTable;