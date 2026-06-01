import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AddLabTestResult = ({ onClose, labTestIdGet, invoiceId, itemData }) => {
  const [allTests, setAllTests] = useState([]); // All tests, including "head" rows, for submission
  const [displayTests, setDisplayTests] = useState([]); // Filtered tests for display
  const [results, setResults] = useState({});
  const [labTestId, setLabTestId] = useState('');
  const [existingResults, setExistingResults] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0); // Track current focused input
  const editorRefs = useRef([]); // Refs for editor fields

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const quillFormats = [
    'bold', 'italic', 'underline',
    'list', 'bullet'
  ];

  useEffect(() => {
    fetchTests();
    fetchExistingResults();
  }, [invoiceId]);

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (displayTests.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setCurrentFocusIndex(prev => {
            const nextIndex = Math.min(prev + 1, displayTests.length - 1);
            // Focus the next editor field
            if (editorRefs.current[nextIndex]) {
              const quillEditor = editorRefs.current[nextIndex].getEditor();
              quillEditor.focus();
            }
            return nextIndex;
          });
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          setCurrentFocusIndex(prev => {
            const prevIndex = Math.max(prev - 1, 0);
            // Focus the previous editor field
            if (editorRefs.current[prevIndex]) {
              const quillEditor = editorRefs.current[prevIndex].getEditor();
              quillEditor.focus();
            }
            return prevIndex;
          });
          break;
        
        case 'Escape':
          e.preventDefault();
          // Clear current editor field
          if (editorRefs.current[currentFocusIndex]) {
            const currentTest = displayTests[currentFocusIndex];
            handleResultChange(currentTest.id, '');
            const quillEditor = editorRefs.current[currentFocusIndex].getEditor();
            quillEditor.setText('');
          }
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [displayTests, currentFocusIndex]);

  // Initialize editor refs when displayTests changes
  useEffect(() => {
    editorRefs.current = editorRefs.current.slice(0, displayTests.length);
  }, [displayTests]);

  // Focus first editor when component mounts or tests load
  useEffect(() => {
    if (displayTests.length > 0 && editorRefs.current[0]) {
      setTimeout(() => {
        const quillEditor = editorRefs.current[0].getEditor();
        quillEditor.focus();
      }, 100);
    }
  }, [displayTests]);

  const fetchTests = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/get-lab-test-heads/${labTestIdGet}`)
      .then(res => {
        if (res.data.results.length > 0) {
          const testsData = res.data.results;
          // Store all tests for submission
          setAllTests(testsData);
          // Filter tests for display (exclude "head" rows)
          const filteredTests = testsData.filter(test => 
            test.ref_range !== "head" && test.unit !== "head"
          );
          setDisplayTests(filteredTests);
          setLabTestId(testsData[0].lab_test_id);

          // Initialize results for "head" rows
          const initialResults = {};
          testsData.forEach(test => {
            if (test.ref_range === "head" || test.unit === "head") {
              initialResults[test.id] = "head";
            }
          });
          setResults(prev => ({ ...prev, ...initialResults }));
        }
      })
      .catch(err => console.log(err));
  };

  const fetchExistingResults = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-lab-test-results?invoice_id=${invoiceId}`
      );
      
      console.log("API Response:", response.data);
  
      if (response.data.success) {
        const receivedResults = response.data.results || [];
        setExistingResults(receivedResults);
        
        const initialResults = {};
        
        receivedResults.forEach(item => {
          try {
            const resultData = typeof item.results === 'string' 
              ? JSON.parse(item.results) 
              : item.results;
            
            console.log("Parsed results:", resultData);
            
            if (resultData && typeof resultData === 'object') {
              Object.entries(resultData).forEach(([testId, testData]) => {
                initialResults[testId] = testData.result || '';
              });
            }
          } catch (e) {
            console.error("Error parsing result:", e);
          }
        });
        
        console.log("Initial results for form:", initialResults);
        setResults(prev => ({ ...prev, ...initialResults }));
        setIsEditing(receivedResults.length > 0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.error || 'Error loading results');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use allTests to include "head" rows in the payload
    const combinedResults = allTests.reduce((acc, test) => {
      acc[test.id] = {
        test_description: test.test_description,
        result: results[test.id] || (test.ref_range === "head" || test.unit === "head" ? "head" : ''),
        ref_range: test.ref_range,
        unit: test.unit,
        order: test.period
      };
      return acc;
    }, {});
  
    console.log("Combined payload:", combinedResults);
  
    const payload = {
      invoice_id: invoiceId,
      lab_test_id: labTestId,
      results: JSON.stringify(combinedResults)
    };
  
    try {
      const endpoint = isEditing ? 'update-lab-test-results' : 'add-lab-test-results';
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/${endpoint}`,
        payload
      );
      
      toast.success(response.data.message);
      // onClose();
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error(error.response?.data?.message || 'Error saving results');
    }
  };

  const handleResultChange = (testId, value) => {
    setResults(prev => ({
      ...prev,
      [testId]: value
    }));
  };

  return (
    <div className='p-2'>
      <h6 className='text-warning bg-primary p-2 card-header border'>
        <i className="fas fa-clock"></i> {displayTests.length > 0 ? displayTests[0].lab_test : ""}
      </h6>
      
      {/* Keyboard Navigation Instructions */}
      <div className="alert alert-info alert-sm mb-3" style={{ fontSize: '0.875rem' }}>
        <i className="fas fa-keyboard me-2"></i>
        <strong>Keyboard Navigation:</strong> Use ↑ ↓ arrow keys to navigate between fields, 
        <strong>Escape</strong> to clear current field. 
        <br />
        <i className="fas fa-edit me-2"></i>
        <strong>Rich Text Editing:</strong> Use the toolbar to format text with <strong>bold</strong>, <em>italic</em>, 
        <u>underline</u>, and create lists.
      </div>
      
      <form onSubmit={handleSubmit}>
        <div>
          <table className='table' style={{ border: '1px solid #dee2e6' }}>
            <thead>
              <tr>
                <th className='text-center'>Sr.No</th>
                <th>Test Description</th>
                <th>Results</th>
                <th>Reference Range</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {displayTests.map((test, index) => (
                <tr key={test.id} className={currentFocusIndex === index ? 'table-active' : ''}>
                  <td className="text-center">{index + 1}</td>
                  <td>{test.test_description}</td>
                  <td>
                    <div 
                      className={`quill-editor-container ${currentFocusIndex === index ? 'focused' : ''}`}
                      style={{
                        border: currentFocusIndex === index ? '2px solid #007bff' : '1px solid #ced4da',
                        borderRadius: '4px',
                        backgroundColor: currentFocusIndex === index ? '#f8f9ff' : '#ffffff',
                        padding: '0',
                        margin: '0'
                      }}
                    >
                      <ReactQuill
                        value={results[test.id] || ""}
                        onChange={(value) => handleResultChange(test.id, value)}
                        modules={quillModules}
                        formats={quillFormats}
                        ref={(el) => {
                          editorRefs.current[index] = el;
                        }}
                        style={{ 
                          height: '120px',
                          fontSize: '14px'
                        }}
                        onFocus={() => setCurrentFocusIndex(index)}
                        theme="snow"
                        placeholder="Enter test result..."
                      />
                    </div>
                  </td>
                  <td>{test.ref_range}</td>
                  <td>{test.unit}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4}></td>
                <td>
                  <button type="submit" className='btn btn-sm btn-warning'>
                    {isEditing ? 'Update Results' : 'Add Results'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
};

export default AddLabTestResult;