import { useState, useEffect } from 'react';
import { validateTableauSource } from '../utils/validateData';

export function ValidationPage() {
  const [validation, setValidation] = useState<Awaited<ReturnType<typeof validateTableauSource>> | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    async function runValidation() {
      setIsValidating(true);
      const result = await validateTableauSource();
      setValidation(result);
      setIsValidating(false);
    }
    runValidation();
  }, []);

  if (isValidating) {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Tableau Source Validation</h1>
        <p>Running validation...</p>
      </div>
    );
  }

  if (!validation) {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Tableau Source Validation</h1>
        <p style={{ color: 'red' }}>Validation failed to complete</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Tableau Source Validation Report</h1>

      <div
        style={{
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: validation.isValid ? '#d4edda' : '#f8d7da',
          borderRadius: '5px',
          border: `1px solid ${validation.isValid ? '#c3e6cb' : '#f5c6cb'}`,
        }}
      >
        <h2 style={{ marginTop: 0, color: validation.isValid ? '#155724' : '#721c24' }}>
          Status: {validation.isValid ? '✓ PASSED' : '✗ FAILED'}
        </h2>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>Summary</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px', fontSize: '16px' }}>
            <strong>Total Records:</strong> {validation.summary.totalRecords.toLocaleString()}
          </li>
          <li style={{ marginBottom: '10px', fontSize: '16px' }}>
            <strong>Unique Start Stations:</strong> {validation.summary.uniqueStartStations}
          </li>
          <li style={{ marginBottom: '10px', fontSize: '16px' }}>
            <strong>Unique End Stations:</strong> {validation.summary.uniqueEndStations}
          </li>
          <li style={{ marginBottom: '10px', fontSize: '16px' }}>
            <strong>Valid Dates:</strong> {validation.summary.hasValidDates ? '✓ Yes' : '✗ No'}
          </li>
          <li style={{ marginBottom: '10px', fontSize: '16px' }}>
            <strong>Valid Coordinates:</strong> {validation.summary.hasValidCoordinates ? '✓ Yes' : '✗ No'}
          </li>
        </ul>
      </div>

      {validation.errors.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ borderBottom: '2px solid #dc3545', paddingBottom: '10px', color: '#dc3545' }}>
            Errors ({validation.errors.length})
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {validation.errors.map((error, index) => (
              <li
                key={index}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24',
                }}
              >
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ borderBottom: '2px solid #ffc107', paddingBottom: '10px', color: '#856404' }}>
            Warnings ({validation.warnings.length})
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {validation.warnings.map((warning, index) => (
              <li
                key={index}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  color: '#856404',
                }}
              >
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.isValid && validation.errors.length === 0 && validation.warnings.length === 0 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '5px',
            color: '#155724',
          }}
        >
          <h3 style={{ marginTop: 0 }}>✓ All checks passed!</h3>
          <p>The Tableau data source is being parsed correctly and is ready for use.</p>
        </div>
      )}

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
