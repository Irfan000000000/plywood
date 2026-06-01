// // components/Modal.js
// const Modal = ({
//     isOpen,
//     onClose,
//     title,
//     children,
//     maxWidth = "1200px",
//     showFooter = true,
//     closeOnOutsideClick = true
//   }) => {
//     if (!isOpen) return null;
  
//     return (
//       <div 
//         className="modal-overlay"
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: "rgba(0, 0, 0, 0.5)",
//           zIndex: 1050,
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           backdropFilter: "blur(2px)",
//           height: "100vh"
//         }}
//         onClick={closeOnOutsideClick ? onClose : null}
//       >
//         <div 
//           className="modal-content"
//           style={{
//             position: "relative",
//             backgroundColor: "#fff",
//             borderRadius: "8px",
//             boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
//             width: "98%",
//             // maxWidth: maxWidth,
//             height: "96vh",
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden"
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div style={headerStyle}>
//             <h5 style={{ margin: 0, fontWeight: 600 }}>{title}</h5>
//             <button
//               onClick={onClose}
//               style={closeButtonStyle}
//               aria-label="Close modal"
//             >
//               &times;
//             </button>
//           </div>
  
//           {/* Content */}
//           <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
//             {children}
//           </div>
//         </div>
//       </div>
//     );
//   };
  
//   // Styles can be moved to a separate constant or CSS file
//   const headerStyle = {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "12px 20px",
//     backgroundColor: "#f8f9fa",
//     borderBottom: "1px solid #dee2e6"
//   };
  
//   const closeButtonStyle = {
//     background: "none",
//     border: "none",
//     fontSize: "1.5rem",
//     cursor: "pointer",
//     color: "#6c757d",
//     width: "40px",
//     height: "40px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: "50%",
//     transition: "all 0.2s"
//   };
  

//   export default Modal;



// // components/Modal.js
// import { useEffect } from 'react';
// const Modal = ({
//     isOpen,
//     onClose,
//     title,
//     children,
//     maxWidth = "1200px",
//     showFooter = true,
//     closeOnOutsideClick = true
//   }) => {

//      useEffect(() => {
//       if (!isOpen) return;

//       const handleKeyDown = (e) => {
//         // Check for Ctrl+X
//         if (e.ctrlKey && e.key === 'x') {
//           e.preventDefault();
//           onClose();
//         }
//       };

//       window.addEventListener('keydown', handleKeyDown);
      
//       // Cleanup
//       return () => {
//         window.removeEventListener('keydown', handleKeyDown);
//       };
//     }, [isOpen, onClose]);

//     if (!isOpen) return null;
  
//     return (
//       <div 
//         className="modal-overlay"
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: "rgba(0, 0, 0, 0.5)",
//           zIndex: 1050,
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           backdropFilter: "blur(2px)",
//           height: "100vh"
//         }}
//         onClick={closeOnOutsideClick ? onClose : null}
//       >
//         <div 
//           className="modal-content"
//           style={{
//             position: "relative",
//             backgroundColor: "#fff",
//             borderRadius: "8px",
//             boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
//             width: "98%",
//             // maxWidth: maxWidth,
//             height: "96vh",
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden"
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div style={headerStyle}>
//             <h5 style={{ margin: 0, fontWeight: 600 }}>{title}</h5>
//             <button
//               onClick={onClose}
//               style={closeButtonStyle}
//               aria-label="Close modal"
//             >
//               &times;
//             </button>
//           </div>
  
//           {/* Content */}
//           <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
//             {children}
//           </div>
//         </div>
//       </div>
//     );
//   };
  
//   // Styles can be moved to a separate constant or CSS file
//   const headerStyle = {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "12px 20px",
//     backgroundColor: "#f8f9fa",
//     borderBottom: "1px solid #dee2e6"
//   };
  
//   const closeButtonStyle = {
//     background: "none",
//     border: "none",
//     fontSize: "1.5rem",
//     cursor: "pointer",
//     color: "#6c757d",
//     width: "40px",
//     height: "40px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: "50%",
//     transition: "all 0.2s"
//   };
  

//   export default Modal;



import { useEffect, useRef } from 'react';

// Track modal stack globally
let modalStack = [];

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "1200px",
    showFooter = true,
    closeOnOutsideClick = true
  }) => {
    const modalId = useRef(Symbol('modal'));

    useEffect(() => {
      if (!isOpen) return;

      // Add this modal to the stack when it opens
      modalStack.push(modalId.current);

      const handleKeyDown = (e) => {
        // Check for Ctrl+X and if this is the topmost modal
        if (e.ctrlKey && e.key === 'x') {
          const topModal = modalStack[modalStack.length - 1];
          if (topModal === modalId.current) {
            e.preventDefault();
            onClose();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      
      // Cleanup
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        // Remove this modal from the stack
        modalStack = modalStack.filter(id => id !== modalId.current);
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;
  
    return (
      <div 
        className="modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000 + modalStack.indexOf(modalId.current),
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(2px)",
          height: "100vh"
        }}
        onClick={closeOnOutsideClick ? onClose : null}
      >
        <div 
          className="modal-content"
          style={{
            position: "relative",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
            width: "98%",
            // maxWidth: maxWidth,
            height: "96vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={headerStyle}>
            <h5 style={{ margin: 0, fontWeight: 600 }}>{title}</h5>
            <button
              onClick={onClose}
              style={closeButtonStyle}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
  
          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  // Styles can be moved to a separate constant or CSS file
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #dee2e6"
  };
  
  const closeButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#6c757d",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "all 0.2s"
  };
  
  export default Modal;