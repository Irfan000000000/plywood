import React from 'react';

const PrintLabResults = React.forwardRef(({ results }, ref) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div ref={ref} className="p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Clinic Header */}
      <div className="text-center mb-4 border-bottom pb-3">
        <h1 className="mb-1" style={{ color: '#2c3e50', fontSize: '28px' }}>Rehman Medical Center</h1>
        <p className="mb-1" style={{ fontSize: '14px', color: '#7f8c8d' }}>
          Yum Backers wali Gali, P 15/3 End Lane.2 Lala Rukh Wah Cantt | Phone: +92 333 956 80 94
        </p>
        <h2 className="mt-3" style={{ color: '#3498db', fontSize: '22px' }}>Laboratory Test Report</h2>
      </div>

      {/* Patient Information */}
      <div className="row mb-4">
        <div className="col-md-6">
          <table className="table table-sm table-borderless">
            <tbody>
              <tr>
                <td style={{ width: '40%', fontWeight: 'bold' }}>Patient Name:</td>
                <td>{results[0]?.full_name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Age/Gender:</td>
                <td>{results[0]?.age || 'N/A'} / {results[0]?.gender || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <table className="table table-sm table-borderless">
            <tbody>
              <tr>
                <td style={{ width: '40%', fontWeight: 'bold' }}>Report Date:</td>
                <td>{formatDate(results[0]?.created_at)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Invoice #:</td>
                <td>{results[0]?.invoice_id || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Results */}
      {results.map((testGroup, groupIndex) => (
        <div key={groupIndex} className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 style={{ color: '#2980b9', fontSize: '18px' }}>
              <strong>{testGroup.lab_test}</strong>
            </h4>
            <small style={{ color: '#7f8c8d' }}>
              Collected: {formatDate(testGroup.created_at)}
            </small>
          </div>

          <table className="table table-bordered" style={{ pageBreakInside: 'avoid' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ width: '5%', textAlign: 'center' }}>#</th>
                <th style={{ width: '35%' }}>Test</th>
                <th style={{ width: '20%', textAlign: 'center' }}>Result</th>
                <th style={{ width: '20%' }}>Reference Range</th>
                <th style={{ width: '20%' }}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(testGroup.parsedResults).map(([testId, test], index) => (
                <tr key={testId}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>{test.test_description}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{test.result}</td>
                  <td>{test.ref_range}</td>
                  <td>{test.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Footer */}
      <div className="mt-4 pt-3 border-top">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-1"><strong>Technician:</strong> ___________________</p>
          </div>
          <div className="col-md-6 text-end">
            <p className="mb-1"><strong>Pathologist:</strong> ___________________</p>
          </div>
        </div>
        <div className="text-center mt-3">
          <p style={{ fontSize: '12px', color: '#95a5a6' }}>
            This is an electronically generated report. No signature required.
            <br />
            For any queries, please contact the laboratory within 7 days of report issuance.
          </p>
        </div>
      </div>
    </div>
  );
});

export default PrintLabResults;