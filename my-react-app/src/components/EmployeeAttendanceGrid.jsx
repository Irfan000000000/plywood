// import React, { useEffect, useState } from 'react';

// const EmployeeAttendanceGrid = () => {
//   const [groupedData, setGroupedData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch data from backend API
//   useEffect(() => {
//     const fetchAttendanceData = async () => {
//       try {
//         const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance`);
//         if (!response.ok) throw new Error('Network response was not ok');

//         const data = await response.json();
//         const grouped = groupByEmployeeAndDate(data);
//         setGroupedData(grouped);
//         setLoading(false);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError('Failed to load attendance data.');
//         setLoading(false);
//       }
//     };

//     fetchAttendanceData();
//   }, []);

//   // Group data by employee and date
//   const groupByEmployeeAndDate = (records) => {
//     const grouped = {};

//     for (const rec of records) {
//       const [date, time] = rec.recordTime.split(' ');
//       if (!grouped[rec.employeeName]) grouped[rec.employeeName] = {};
//       if (!grouped[rec.employeeName][date]) grouped[rec.employeeName][date] = [];

//       grouped[rec.employeeName][date].push(time);
//     }

//     return grouped;
//   };

//   if (loading) return <p>Loading attendance data...</p>;
//   if (error) return <p style={{ color: 'red' }}>{error}</p>;

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>🕒 Employee Attendance</h2>
//       {Object.entries(groupedData).map(([employeeName, dates]) => (
//         <div key={employeeName} style={{ marginBottom: '30px' }}>
//           <h3>👤 {employeeName}</h3>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <tbody>
//               {Object.entries(dates).map(([date, times]) => (
//                 <tr key={date} style={{ borderBottom: '1px solid #ccc' }}>
//                   <td style={{ padding: '8px', fontWeight: 'bold', width: '150px' }}>📅 {date}</td>
//                   {times.map((time, idx) => (
//                     <td key={idx} style={{ padding: '8px' }}>{time}</td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default EmployeeAttendanceGrid;


// import React, { useEffect, useState } from 'react';

// const EmployeeAttendanceGrid = () => {
//   const [allData, setAllData] = useState([]); // raw data from API
//   const [groupedData, setGroupedData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [selectedEmployee, setSelectedEmployee] = useState('All');
//   const [selectedMonth, setSelectedMonth] = useState('All'); // format: "2025-06"

//   // Fetch data once on mount
//   useEffect(() => {
//     const fetchAttendanceData = async () => {
//       try {
//         const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance`);
//         if (!response.ok) throw new Error('Network response was not ok');

//         const data = await response.json();
//         setAllData(data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError('Failed to load attendance data.');
//         setLoading(false);
//       }
//     };

//     fetchAttendanceData();
//   }, []);

//   // Filter & group data whenever allData, selectedEmployee, or selectedMonth changes
//   useEffect(() => {
//     let filtered = allData;

//     if (selectedEmployee !== 'All') {
//       filtered = filtered.filter(r => r.employeeName === selectedEmployee);
//     }

//     if (selectedMonth !== 'All') {
//       filtered = filtered.filter(r => r.recordTime.startsWith(selectedMonth));
//     }

//     setGroupedData(groupByEmployeeAndDate(filtered));
//   }, [allData, selectedEmployee, selectedMonth]);

//   // Helper to group data by employee and date
//   const groupByEmployeeAndDate = (records) => {
//     const grouped = {};

//     for (const rec of records) {
//       const [date, time] = rec.recordTime.split(' ');
//       if (!grouped[rec.employeeName]) grouped[rec.employeeName] = {};
//       if (!grouped[rec.employeeName][date]) grouped[rec.employeeName][date] = [];

//       grouped[rec.employeeName][date].push(time);
//     }

//     return grouped;
//   };

//   // Get distinct employees for dropdown
//   const employeeOptions = ['All', ...Array.from(new Set(allData.map(r => r.employeeName)))];

//   // Get distinct months (YYYY-MM) for dropdown
//   const monthSet = new Set(allData.map(r => r.recordTime.slice(0, 7))); // "YYYY-MM"
//   const monthOptions = ['All', ...Array.from(monthSet).sort()];

//   if (loading) return <p>Loading attendance data...</p>;
//   if (error) return <p style={{ color: 'red' }}>{error}</p>;

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>🕒 Employee Attendance</h2>

//       {/* Filters */}
//       <div style={{ marginBottom: '20px' }}>
//         <label>
//           Employee:{' '}
//           <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
//             {employeeOptions.map(emp => (
//               <option key={emp} value={emp}>{emp}</option>
//             ))}
//           </select>
//         </label>

//         <label style={{ marginLeft: '20px' }}>
//           Month:{' '}
//           <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
//             {monthOptions.map(month => (
//               <option key={month} value={month}>
//                 {month === 'All' ? 'All' : new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
//               </option>
//             ))}
//           </select>
//         </label>
//       </div>

//       {/* Attendance Table */}
//       {Object.entries(groupedData).length === 0 && <p>No records found.</p>}

//       {Object.entries(groupedData).map(([employeeName, dates]) => (
//         <div key={employeeName} style={{ marginBottom: '30px' }}>
//           <h3>👤 {employeeName}</h3>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <tbody>
//               {Object.entries(dates).map(([date, times]) => (
//                 <tr key={date} style={{ borderBottom: '1px solid #ccc' }}>
//                   <td style={{ padding: '8px', fontWeight: 'bold', width: '150px' }}>📅 {date}</td>
//                   {times.map((time, idx) => (
//                     <td key={idx} style={{ padding: '8px' }}>{time}</td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default EmployeeAttendanceGrid;

// import React, { useEffect, useState } from 'react';

// const EmployeeAttendanceGrid = () => {
//   const [allData, setAllData] = useState([]);
//   const [groupedData, setGroupedData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [selectedEmployee, setSelectedEmployee] = useState('All');
//   const [selectedMonth, setSelectedMonth] = useState('All'); // e.g., "2025-06"

//   // Helper to convert "YYYY-MM" into readable format
//   const getMonthLabel = (monthStr) => {
//     const [year, month] = monthStr.split('-').map(Number);
//     const date = new Date(year, month - 1); // JS months are 0-based
//     return date.toLocaleString('default', { month: 'long', year: 'numeric' });
//   };

//   // Fetch attendance data from API
//   useEffect(() => {
//     const fetchAttendanceData = async () => {
//       try {
//         const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance`);
//         if (!response.ok) throw new Error('Network response was not ok');
//         const data = await response.json();
//         setAllData(data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError('Failed to load attendance data.');
//         setLoading(false);
//       }
//     };

//     fetchAttendanceData();
//   }, []);

//   // Recalculate grouped data on any change
//   useEffect(() => {
//     let filtered = allData;

//     if (selectedEmployee !== 'All') {
//       filtered = filtered.filter(r => r.employeeName === selectedEmployee);
//     }

//     if (selectedMonth !== 'All') {
//       filtered = filtered.filter(r => r.recordTime.startsWith(selectedMonth));
//     }

//     setGroupedData(groupByEmployeeAndDate(filtered));
//   }, [allData, selectedEmployee, selectedMonth]);

//   // Group data by employee then date
//   const groupByEmployeeAndDate = (records) => {
//     const grouped = {};

//     for (const rec of records) {
//       const [date, time] = rec.recordTime.split(' ');
//       if (!grouped[rec.employeeName]) grouped[rec.employeeName] = {};
//       if (!grouped[rec.employeeName][date]) grouped[rec.employeeName][date] = [];

//       grouped[rec.employeeName][date].push(time);
//     }

//     return grouped;
//   };

//   // Create employee and month filter options
//   const employeeOptions = ['All', ...Array.from(new Set(allData.map(r => r.employeeName)))];
//   const monthSet = new Set(allData.map(r => r.recordTime.slice(0, 7))); // "YYYY-MM"
//   const monthOptions = ['All', ...Array.from(monthSet).sort()];

//   if (loading) return <p>Loading attendance data...</p>;
//   if (error) return <p style={{ color: 'red' }}>{error}</p>;

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>🕒 Employee Attendance</h2>

//       {/* Filters */}
//       <div style={{ marginBottom: '20px' }}>
//         <label>
//           Employee:{' '}
//           <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
//             {employeeOptions.map(emp => (
//               <option key={emp} value={emp}>{emp}</option>
//             ))}
//           </select>
//         </label>

//         <label style={{ marginLeft: '20px' }}>
//           Month:{' '}
//           <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
//             {monthOptions.map(month => (
//               <option key={month} value={month}>
//                 {month === 'All' ? 'All' : getMonthLabel(month)}
//               </option>
//             ))}
//           </select>
//         </label>
//       </div>

//       {/* Attendance Display */}
//       {Object.entries(groupedData).length === 0 && <p>No records found.</p>}

//       {Object.entries(groupedData).map(([employeeName, dates]) => (
//         <div key={employeeName} style={{ marginBottom: '30px' }}>
//           <h3>👤 {employeeName}</h3>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <tbody>
//               {Object.entries(dates).map(([date, times]) => (
//                 <tr key={date} style={{ borderBottom: '1px solid #ccc' }}>
//                   <td style={{ padding: '8px', fontWeight: 'bold', width: '150px' }}>📅 {date}</td>
//                   {times.map((time, idx) => (
//                     <td key={idx} style={{ padding: '8px' }}>{time}</td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default EmployeeAttendanceGrid;



// import React, { useEffect, useState } from 'react';

// import useWebSocket from './useWebSocket';

// const EmployeeAttendanceGrid = () => {
//   const [allData, setAllData] = useState([]);
//   const [groupedData, setGroupedData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [selectedEmployee, setSelectedEmployee] = useState('All');
//   const [selectedMonth, setSelectedMonth] = useState(''); // format: "YYYY-MM"

//   // Fetch filtered data whenever employee or month changes


//     const fetchFilteredData = async () => {
//       try {
//         const params = new URLSearchParams();
//         if (selectedEmployee !== 'All') params.append('employee', selectedEmployee);
//         if (selectedMonth) params.append('month', selectedMonth);

//         const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance?${params}`);
//         if (!response.ok) throw new Error('Network response was not ok');

//         const data = await response.json();
//         setAllData(data);
//         setGroupedData(groupByEmployeeAndDate(data));
//         setLoading(false);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError('Failed to load attendance data.');
//         setLoading(false);
//       }
//     };


//   useEffect(() => {
  
//     fetchFilteredData();
//   }, [selectedEmployee, selectedMonth]);



//    const handleWebSocketMessage = (data) => {
//       fetchFilteredData();
//   };


//     useWebSocket('ws://192.168.1.89:4000', handleWebSocketMessage);

//   // Group data by employee -> date -> times
//   const groupByEmployeeAndDate = (records) => {
//     const grouped = {};
//     for (const rec of records) {
//       const [date, time] = rec.recordTime.split(' ');
//       if (!grouped[rec.employeeName]) grouped[rec.employeeName] = {};
//       if (!grouped[rec.employeeName][date]) grouped[rec.employeeName][date] = [];
//       grouped[rec.employeeName][date].push(time);
//     }
//     return grouped;
//   };

//   // Get distinct employee names for dropdown
//   const employeeOptions = ['All', ...Array.from(new Set(allData.map(r => r.employeeName)))];

//   if (loading) return <p>Loading attendance data...</p>;
//   if (error) return <p style={{ color: 'red' }}>{error}</p>;

//   return (
//     <div style={{ padding: '20px' }}>
//       <h5>🕒 Employee Attendance</h5>

//       {/* Filters */}
//       <div style={{ marginBottom: '20px' }}>
//         <label>
//           Employee:{' '}
//           <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
//             {employeeOptions.map(emp => (
//               <option key={emp} value={emp}>{emp}</option>
//             ))}
//           </select>
//         </label>

//         <label style={{ marginLeft: '20px' }}>
//           Month:{' '}
//           <input
//             type="month"
//             value={selectedMonth}
//             onChange={e => setSelectedMonth(e.target.value)}
//           />
//         </label>
//       </div>

//       {/* Attendance Display */}
//       {Object.entries(groupedData).length === 0 && <p>No records found.</p>}

      

//       {Object.entries(groupedData).map(([employeeName, dates]) => (
//   <div key={employeeName} style={{ marginBottom: '30px' }}>
//     <h6>
//       👤 {employeeName} &nbsp;|&nbsp; 🗓️ Days Present: {Object.keys(dates).length}
//     </h6>
//     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//       <tbody>
//         {Object.entries(dates).map(([date, times]) => (
//           <tr key={date} style={{ borderBottom: '1px solid #ccc' }}>
//             <td style={{ padding: '8px', fontWeight: 'bold', width: '150px' }}>📅 {date}</td>
//             {times.map((time, idx) => (
//               <td key={idx} style={{ padding: '8px' }}>{time}</td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// ))}

//     </div>
//   );
// };

// export default EmployeeAttendanceGrid;



import React, { useEffect, useState } from 'react';
import useWebSocket from './useWebSocket';

const EmployeeAttendanceGrid = () => {
  const [allData, setAllData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('');

  const fetchFilteredData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedEmployee !== 'All') params.append('employee', selectedEmployee);
      if (selectedMonth) params.append('month', selectedMonth);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance?${params}`);
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setAllData(data);
      setGroupedData(groupByEmployeeAndDate(data));
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load attendance data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredData();
  }, [selectedEmployee, selectedMonth]);

  const handleWebSocketMessage = () => {
    fetchFilteredData();
  };

  useWebSocket('ws://192.168.1.89:4000', handleWebSocketMessage);

  const groupByEmployeeAndDate = (records) => {
    const grouped = {};
    for (const rec of records) {
      const [date, time] = rec.recordTime.split(' ');
      if (!grouped[rec.employeeName]) grouped[rec.employeeName] = {};
      if (!grouped[rec.employeeName][date]) grouped[rec.employeeName][date] = [];
      grouped[rec.employeeName][date].push(time);
    }
    return grouped;
  };

  const employeeOptions = ['All', ...Array.from(new Set(allData.map(r => r.employeeName)))];

  if (loading) return <p style={{ fontSize: '1.1rem' }}>Loading attendance data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🕒 Employee Attendance Dashboard</h2>

      {/* Filters */}
      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>
          👤 Employee:
          <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} style={styles.select}>
            {employeeOptions.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </label>

        <label style={{ ...styles.filterLabel, marginLeft: '30px' }}>
          📅 Month:
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={styles.input}
          />
        </label>
      </div>

      {/* Attendance Records */}
      {Object.entries(groupedData).length === 0 ? (
        <p style={styles.noData}>No records found.</p>
      ) : (
        Object.entries(groupedData).map(([employeeName, dates]) => (
          <div key={employeeName} style={styles.card}>
            <h4 style={styles.cardHeader}>
              👤 {employeeName} | 🗓️ Days Present: {Object.keys(dates).length}
            </h4>
            <table style={styles.table}>
              <tbody>
                {Object.entries(dates).map(([date, times]) => (
                  <tr key={date}>
                    <td style={styles.dateCell}>📅 {date}</td>
                    {times.map((time, idx) => (
                      <td key={idx} style={styles.timeCell}>{time}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    backgroundColor: '#f7f9fc',
    minHeight: '100vh',
  },
  title: {
    marginBottom: '20px',
    color: '#2c3e50',
  },
  filterBar: {
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: '16px',
    color: '#444',
  },
  select: {
    marginLeft: '8px',
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  input: {
    marginLeft: '8px',
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    marginBottom: '15px',
    color: '#2d6a4f',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  dateCell: {
    padding: '10px',
    fontWeight: 'bold',
    backgroundColor: '#e0f7fa',
    width: '150px',
  },
  timeCell: {
    padding: '10px',
    backgroundColor: '#f1f8e9',
    borderLeft: '1px solid #ddd',
  },
  noData: {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: '#999',
  },
};

export default EmployeeAttendanceGrid;
