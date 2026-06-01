// formValidator.js
export const validateFields = (formData, requiredFields) => {
    const errors = {};
    
    requiredFields.forEach(field => {
      if (formData[field] === null || formData[field] === undefined || formData[field] === '') {
        errors[field] = true;
      }
    });
    
    return errors;
  };
  
  export const applyFieldStyles = (fieldName, errors, existingStyles = {}) => {
    if (errors[fieldName]) {
      return { 
        ...existingStyles,
        backgroundColor: '#ffdddd', 
        border: '1px solid red' 
      };
    }
    return existingStyles;
  };