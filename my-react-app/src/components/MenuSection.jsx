// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// // NOTE: This component assumes the following props are passed to it:
// // { user, setShow, resetFormData, setShowShortcutsHelp }

// function MenuSection({ user, setShow, resetFormData, setShowShortcutsHelp }) {
//   // State to track if the screen is mobile size (<= 768px)
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   // State to control the visibility of the menu on mobile
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       const newIsMobile = window.innerWidth <= 768;
//       setIsMobile(newIsMobile);
//       // Close the menu if we resize from mobile to desktop
//       if (!newIsMobile) {
//         setMenuOpen(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const handleMenuItemClick = () => {
//     // Close the menu after an item is clicked on mobile
//     if (isMobile) {
//       setMenuOpen(false);
//     }
//   };

//   // --- Hamburger Button (Visible only on mobile) ---
//   const HamburgerButton = (
//     <div style={{
//       display: 'flex',
//       justifyContent: 'flex-start',
//       alignItems: 'center',
//       padding: '10px 15px',
//       borderBottom: '1px solid #dee2e6',
//       width: '100%'
//     }}>
//       <button
//         onClick={() => setMenuOpen(!menuOpen)}
//         className="btn btn-warning"
//         style={{
//           fontSize: '16px',
//           cursor: 'pointer',
//           padding: '8px 12px',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '8px'
//         }}
//         title="Toggle Menu"
//       >
//         <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
//         {menuOpen ? 'Close Menu' : 'Open Menu'}
//       </button>
//     </div>
//   );

//   // --- Menu Items Container ---
//   const MenuItems = (
//     <div
//       className="d-flex justify-content-start flex-wrap mt-2 pl-4"
//       style={{
//         // Conditional styles for mobile view
//         display: isMobile && !menuOpen ? 'none' : 'flex', // Hide on mobile if closed
//         flexDirection: isMobile ? 'column' : 'row', // Stack vertically on mobile
//         flexWrap: isMobile ? 'nowrap' : 'wrap',
//         paddingLeft: isMobile ? '0' : '1rem', // Remove left padding on mobile
//         padding: isMobile ? '10px 15px' : '0', // Add padding to the container on mobile
//         width: isMobile ? '100%' : 'auto',
//         // Ensure buttons take full width on mobile
//         '& > *': {
//           width: isMobile ? '100%' : 'auto',
//           marginBottom: isMobile ? '10px' : '0.5rem',
//           marginRight: isMobile ? '0' : '0.5rem',
//         }
//       }}
//     >
//       {/* 1. Create Stock */}
//       <a
//         href="#"
//         className="btn btn-sm btn-warning mb-2 mr-2"
//         onClick={handleMenuItemClick}
//         style={{ width: isMobile ? '100%' : 'auto' }}
//       >
//         <Link to="/stock" style={{ color: 'inherit', textDecoration: 'none' }}>
//           <i className="fas fa-truck"></i> Create Stock
//         </Link>
//       </a>

//       {/* 2. Conditional Items (Stock Report, Income Report) */}
//       {user.user.user_type !== 'Receptionist' && (
//         <>
//           {/* Stock Report */}
//           <a
//             href="#"
//             className="btn btn-sm btn-warning mb-2 mr-2"
//             onClick={() => { setShow("stock_report"); handleMenuItemClick(); }}
//             style={{ width: isMobile ? '100%' : 'auto' }}
//           >
//             <i className="fas fa-chart-line"></i> Stock Report
//           </a>

//           {/* Income Report */}
//           <a
//             href="#"
//             className="btn btn-sm btn-warning mb-2 mr-2"
//             onClick={() => { setShow("income_report"); handleMenuItemClick(); }}
//             style={{ width: isMobile ? '100%' : 'auto' }}
//           >
//             <i className="fas fa-hand-holding-usd"></i> Income Report
//           </a>
//         </>
//       )}

//       {/* 3. Invoices */}
//       <a
//         href="#"
//         className="btn btn-sm btn-warning mb-2 mr-2"
//         onClick={() => {
//           setShow("invoice");
//           resetFormData();
//           handleMenuItemClick();
//         }}
//         style={{ width: isMobile ? '100%' : 'auto' }}
//       >
//         <i className="fas fa-receipt"></i> Invoices
//       </a>

//       {/* 4. Add Expense */}
//       <a
//         href="#"
//         className="btn btn-sm btn-warning mb-2 mr-2"
//         onClick={() => { setShow("add_expense"); handleMenuItemClick(); }}
//         style={{ width: isMobile ? '100%' : 'auto' }}
//       >
//         <i className="fas fa-minus-circle"></i> Add Expense
//       </a>

//       {/* 5. Add Transactions */}
//       <a
//         href="#"
//         className="btn btn-sm btn-warning mb-2 mr-2"
//         onClick={() => { setShow("add_transactions"); handleMenuItemClick(); }}
//         style={{ width: isMobile ? '100%' : 'auto' }}
//       >
//         <i className="fas fa-exchange-alt"></i> Add Transactions
//       </a>

//       {/* 6. Bank Accounts */}
//       <a
//         href="#"
//         className="btn btn-sm btn-warning mb-2 mr-2"
//         onClick={() => {
//           setShow("bank_accounts");
//           resetFormData();
//           handleMenuItemClick();
//         }}
//         style={{ width: isMobile ? '100%' : 'auto' }}
//       >
//         <i className="fas fa-credit-card"></i> Bank Accounts
//       </a>

//       {/* 7. Heads */}
//       <a
//         href="#"
//         className="btn btn-sm btn-warning mb-2 mr-2"
//         onClick={() => {
//           setShow("heads");
//           resetFormData();
//           handleMenuItemClick();
//         }}
//         style={{ width: isMobile ? '100%' : 'auto' }}
//       >
//         <i className="fas fa-wallet"></i> Heads
//       </a>

//       {/* 8. Shortcuts */}
//       <button
//         className="btn btn-sm mb-2 mr-2 btn-warning"
//         onClick={() => { setShowShortcutsHelp(true); handleMenuItemClick(); }}
//         style={{ width: isMobile ? '100%' : 'auto' }}
//       >
//         <i className="fas fa-keyboard"></i> Shortcuts (Ctrl+H)
//       </button>
//     </div>
//   );

//   return (
//     <>
//       {isMobile && HamburgerButton}
//       {MenuItems}
//     </>
//   );
// }

// export default MenuSection;



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// NOTE: This component assumes the following props are passed to it:
// { user, setShow, resetFormData, setShowShortcutsHelp }

function MenuSection({ user, setShow, resetFormData, setShowShortcutsHelp }) {
  // State to track if the screen is mobile size (<= 768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // State to control the visibility of the menu on mobile
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      // Close the menu if we resize from mobile to desktop
      if (!newIsMobile) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuItemClick = () => {
    // Close the menu after an item is clicked on mobile
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  // --- Hamburger Button (Visible only on mobile) ---
  const HamburgerButton = isMobile && (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: '10px 15px',
      borderBottom: '1px solid #dee2e6',
      width: '100%',
      backgroundColor: '#f8f9fa'
    }}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="btn btn-warning"
        style={{
          fontSize: '16px',
          cursor: 'pointer',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Toggle Menu"
      >
        <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        {menuOpen ? 'Close Menu' : 'Open Menu'}
      </button>
    </div>
  );

  // --- Menu Items Container ---
  const MenuItems = (
    <div
      style={{
        // Only show menu items if on desktop OR (on mobile AND menu is open)
        display: !isMobile || menuOpen ? 'flex' : 'none',
        flexDirection: isMobile ? 'column' : 'row',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        justifyContent: 'flex-start',
        alignItems: isMobile ? 'stretch' : 'center',
        marginTop: isMobile ? '0' : '10px',
        paddingLeft: isMobile ? '0' : '15px',
        paddingRight: isMobile ? '0' : '0',
        padding: isMobile ? '10px 0' : '0',
        width: isMobile ? '100%' : 'auto',
        backgroundColor: isMobile && menuOpen ? '#f8f9fa' : 'transparent',
        borderTop: isMobile && menuOpen ? '1px solid #dee2e6' : 'none'
      }}
    >
      {/* 1. Create Stock */}
      <a
        href="#"
        className="btn btn-sm btn-warning mb-2 mr-2"
        onClick={handleMenuItemClick}
        style={{
          width: isMobile ? '100%' : 'auto',
          margin: isMobile ? '8px 15px' : '0 8px 8px 0',
          textDecoration: 'none'
        }}
      >
        <Link to="/stock" style={{ color: 'inherit', textDecoration: 'none' }}>
          <i className="fas fa-truck"></i> Create Stock
        </Link>
      </a>

      {/* 2. Conditional Items (Stock Report, Income Report) */}
      {user.user.user_type !== 'Receptionist' && (
        <>
          {/* Stock Report */}
          <a
            href="#"
            className="btn btn-sm btn-warning mb-2 mr-2"
            onClick={(e) => {
              e.preventDefault();
              setShow("stock_report");
              handleMenuItemClick();
            }}
            style={{
              width: isMobile ? '100%' : 'auto',
              margin: isMobile ? '8px 15px' : '0 8px 8px 0',
              textDecoration: 'none'
            }}
          >
            <i className="fas fa-chart-line"></i> Stock Report
          </a>

          {/* Income Report */}
          <a
            href="#"
            className="btn btn-sm btn-warning mb-2 mr-2"
            onClick={(e) => {
              e.preventDefault();
              setShow("income_report");
              handleMenuItemClick();
            }}
            style={{
              width: isMobile ? '100%' : 'auto',
              margin: isMobile ? '8px 15px' : '0 8px 8px 0',
              textDecoration: 'none'
            }}
          >
            <i className="fas fa-hand-holding-usd"></i> Income Report
          </a>
        </>
      )}

      {/* 3. Invoices */}
      <a
        href="#"
        className="btn btn-sm btn-warning mb-2 mr-2"
        onClick={(e) => {
          e.preventDefault();
          setShow("invoice");
          resetFormData();
          handleMenuItemClick();
        }}
        style={{
          width: isMobile ? '100%' : 'auto',
          margin: isMobile ? '8px 15px' : '0 8px 8px 0',
          textDecoration: 'none'
        }}
      >
        <i className="fas fa-receipt"></i> Invoices
      </a>

      {/* 4. Add Expense */}
      <a
        href="#"
        className="btn btn-sm btn-warning mb-2 mr-2"
        onClick={(e) => {
          e.preventDefault();
          setShow("add_expense");
          handleMenuItemClick();
        }}
        style={{
          width: isMobile ? '100%' : 'auto',
          margin: isMobile ? '8px 15px' : '0 8px 8px 0',
          textDecoration: 'none'
        }}
      >
        <i className="fas fa-minus-circle"></i> Add Expense
      </a>

      {/* 5. Add Transactions */}
      <a
        href="#"
        className="btn btn-sm btn-warning mb-2 mr-2"
        onClick={(e) => {
          e.preventDefault();
          setShow("add_transactions");
          handleMenuItemClick();
        }}
        style={{
          width: isMobile ? '100%' : 'auto',
          margin: isMobile ? '8px 15px' : '0 8px 8px 0',
          textDecoration: 'none'
        }}
      >
        <i className="fas fa-exchange-alt"></i> Add Transactions
      </a>

      {/* 6. Bank Accounts */}
      <a
        href="#"
        className="btn btn-sm btn-warning mb-2 mr-2"
        onClick={(e) => {
          e.preventDefault();
          setShow("bank_accounts");
          resetFormData();
          handleMenuItemClick();
        }}
        style={{
          width: isMobile ? '100%' : 'auto',
          margin: isMobile ? '8px 15px' : '0 8px 8px 0',
          textDecoration: 'none'
        }}
      >
        <i className="fas fa-credit-card"></i> Bank Accounts
      </a>

      {/* 7. Heads */}
      <a
        href="#"
        className="btn btn-sm btn-warning mb-2 mr-2"
        onClick={(e) => {
          e.preventDefault();
          setShow("heads");
          resetFormData();
          handleMenuItemClick();
        }}
        style={{
          width: isMobile ? '100%' : 'auto',
          margin: isMobile ? '8px 15px' : '0 8px 8px 0',
          textDecoration: 'none'
        }}
      >
        <i className="fas fa-wallet"></i> Heads
      </a>

      {/* 8. Shortcuts */}
      <button
        className="btn btn-sm mb-2 mr-2 btn-warning"
        onClick={(e) => {
          e.preventDefault();
          setShowShortcutsHelp(true);
          handleMenuItemClick();
        }}
        style={{
          width: isMobile ? '100%' : 'auto',
          margin: isMobile ? '8px 15px' : '0 8px 8px 0',
          cursor: 'pointer'
        }}
      >
        <i className="fas fa-keyboard"></i> Shortcuts (Ctrl+H)
      </button>
    </div>
  );

  return (
    <>
      {HamburgerButton}
      {MenuItems}
    </>
  );
}

export default MenuSection;
