// components/Modal.js
const ModalForChild = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "1200px",
    showFooter = true,
    closeOnOutsideClick = true
  }) => {
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
          zIndex: 9999,
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
    borderBottom: "1px solid #dee2e6",
    zIndex: 10000
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
  

  export default ModalForChild;