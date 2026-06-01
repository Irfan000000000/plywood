// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Attendance = () => {
//   const [employees, setEmployees] = useState([]);
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchEmployees = () => {
//       axios.get(process.env.REACT_APP_API_URL+"/employee-list-for-attendance")
//         .then(res => {
//           setEmployees(res.data.results);
//           // Initialize attendance data
//           const initialAttendanceData = res.data.results.map(employee => ({
//             employee_id: employee.id,
//             status: 'present', // default value
//             remarks: ''
//           }));
//           setAttendanceData(initialAttendanceData);
//         })
//         .catch(err => console.log(err));
//     };

//     fetchEmployees();
//   }, []);

//   const fetchAttendanceForDate = (date) => {
//     axios.get(`${process.env.REACT_APP_API_URL}/attendance/${date}`)
//       .then(res => {
//         if (res.data.results.length > 0) {
//           // Update attendance data based on the existing data for the selected date
//           setAttendanceData(res.data.results.map(item => ({
//             employee_id: item.employee_id,
//             status: item.status,
//             remarks: item.remarks
//           })));
//         } else {
//           // Reset attendance data if no existing data is found
//           const initialAttendanceData = employees.map(employee => ({
//             employee_id: employee.id,
//             status: 'present', // default value
//             remarks: ''
//           }));
//           setAttendanceData(initialAttendanceData);
//         }
//       })
//       .catch(err => console.log(err));
//   };

//   const handleStatusChange = (employee_id, status) => {
//     setAttendanceData(prevData =>
//       prevData.map(data =>
//         data.employee_id === employee_id ? { ...data, status } : data
//       )
//     );
//   };

//   const handleRemarksChange = (employee_id, remarks) => {
//     setAttendanceData(prevData =>
//       prevData.map(data =>
//         data.employee_id === employee_id ? { ...data, remarks } : data
//       )
//     );
//   };

//   const handleDateChange = (e) => {
//     const date = e.target.value;
//     setSelectedDate(date);
//     fetchAttendanceForDate(date);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedDate) {
//       setError('Please select a date for attendance.');
//       return;
//     }

//     setError('');

//     try {
//       const response = await axios.post(process.env.REACT_APP_API_URL+'/submit-attendance', {
//         date: selectedDate,
//         attendanceData
//       });
//       alert('Attendance data saved successfully!');
//     } catch (error) {
//       if (error.response && error.response.status === 409) {
//         setError('Attendance for the selected date already exists.');
//       } else {
//         console.error('There was an error!', error);
//       }
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label htmlFor="attendance-date">Select Date:</label>
//         <input
//           type="date"
//           id="attendance-date"
//           value={selectedDate}
//           onChange={handleDateChange}
//         />
//       </div>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       <table>
//         <thead>
//           <tr>
//             <th>Employee Name</th>
//             <th>Present</th>
//             <th>Absent</th>
//             <th>Leave</th>
//             <th>Remarks</th>
//           </tr>
//         </thead>
//         <tbody>
//           {employees.map(employee => (
//             <tr key={employee.id}>
//               <td>{employee.employee_name}</td>
//               <td>
//                 <input
//                   type="radio"
//                   name={`status-${employee.id}`}
//                   value="present"
//                   checked={attendanceData.find(data => data.employee_id === employee.id)?.status === 'present'}
//                   onChange={() => handleStatusChange(employee.id, 'present')}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="radio"
//                   name={`status-${employee.id}`}
//                   value="absent"
//                   checked={attendanceData.find(data => data.employee_id === employee.id)?.status === 'absent'}
//                   onChange={() => handleStatusChange(employee.id, 'absent')}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="radio"
//                   name={`status-${employee.id}`}
//                   value="leave"
//                   checked={attendanceData.find(data => data.employee_id === employee.id)?.status === 'leave'}
//                   onChange={() => handleStatusChange(employee.id, 'leave')}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="text"
//                   value={attendanceData.find(data => data.employee_id === employee.id)?.remarks || ''}
//                   onChange={(e) => handleRemarksChange(employee.id, e.target.value)}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <button type="submit">Submit Attendance</button>
//     </form>
//   );
// };

// export default Attendance;



import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AttendanceForm = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = () => {
      axios.get(process.env.REACT_APP_API_URL+"/employee-list-for-attendance")
        .then(res => {
          setEmployees(res.data.results);
          // Initialize attendance data
          const initialAttendanceData = res.data.results.map(employee => ({
            employee_id: employee.id,
            status: 'present', // default value
            remarks: ''
          }));
          setAttendanceData(initialAttendanceData);
        })
        .catch(err => console.log(err));
    };

    fetchEmployees();
  }, []);

  const fetchAttendanceForDate = (date) => {
    axios.get(`${process.env.REACT_APP_API_URL}/attendance/${date}`)
      .then(res => {
        const existingAttendanceData = res.data.results;

        // Create a map of existing attendance data by employee_id
        const existingAttendanceMap = new Map(
          existingAttendanceData.map(item => [item.employee_id, item])
        );

        // Create updated attendance data with default values for new employees
        const updatedAttendanceData = employees.map(employee => {
          if (existingAttendanceMap.has(employee.id)) {
            return {
              employee_id: employee.id,
              status: existingAttendanceMap.get(employee.id).status,
              remarks: existingAttendanceMap.get(employee.id).remarks
            };
          } else {
            return {
              employee_id: employee.id,
              status: 'present', // default value
              remarks: ''
            };
          }
        });

        setAttendanceData(updatedAttendanceData);
      })
      .catch(err => console.log(err));
  };

  const handleStatusChange = (employee_id, status) => {
    setAttendanceData(prevData =>
      prevData.map(data =>
        data.employee_id === employee_id ? { ...data, status } : data
      )
    );
  };

  const handleRemarksChange = (employee_id, remarks) => {
    setAttendanceData(prevData =>
      prevData.map(data =>
        data.employee_id === employee_id ? { ...data, remarks } : data
      )
    );
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchAttendanceForDate(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      setError('Please select a date for attendance.');
      return;
    }

    setError('');

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL+'/submit-attendance', {
        date: selectedDate,
        attendanceData
      });
      alert(response.data.message);
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <div className='p-2'>
    <h6 className='text-warning bg-primary p-2 card-header border'><i class="fas fa-clock"></i> Employee Attendance</h6>
    <form onSubmit={handleSubmit}>
      <div className='row p-1 d-flex justify-content-center'>
        <div className="col-3">
        <input
          type="date"
          id="attendance-date"
          value={selectedDate}
          onChange={handleDateChange}
          className='form-control'
        />
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div  >
      <table className='table' style={{ border: '1px solid #dee2e6' }}>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Leave</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.employee_name}</td>
              <td>
                <input
                  type="radio"
                  name={`status-${employee.id}`}
                  value="present"
                  checked={attendanceData.find(data => data.employee_id === employee.id)?.status === 'present'}
                  onChange={() => handleStatusChange(employee.id, 'present')}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name={`status-${employee.id}`}
                  value="absent"
                  checked={attendanceData.find(data => data.employee_id === employee.id)?.status === 'absent'}
                  onChange={() => handleStatusChange(employee.id, 'absent')}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name={`status-${employee.id}`}
                  value="leave"
                  checked={attendanceData.find(data => data.employee_id === employee.id)?.status === 'leave'}
                  onChange={() => handleStatusChange(employee.id, 'leave')}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={attendanceData.find(data => data.employee_id === employee.id)?.remarks || ''}
                  onChange={(e) => handleRemarksChange(employee.id, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
       <div className='d-flex justify-content-end'><button type="submit" className='btn btn-sm btn-warning'>Submit Attendance</button></div>
      </div>
    </form>
    </div>
  );
};

export default AttendanceForm;

