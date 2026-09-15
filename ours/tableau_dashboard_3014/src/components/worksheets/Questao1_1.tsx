import { useEffect, useState, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import type { HospitalData } from '../../types';
import { useInteraction } from '../../hooks/useInteraction';
import './Questao1_1.css';

interface Questao1_1Props {
  className?: string;
}

export function Questao1_1({ className = '' }: Questao1_1Props) {
  const [data, setData] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSelection, setSelection, filterState } = useInteraction();

  const selection = useMemo(() => getSelection('questao1.1'), [getSelection]);

  useEffect(() => {
    async function loadData() {
      await dataService.loadData();
      const hospitalData = dataService.getAllData();
      setData(hospitalData);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    if (!filterState?.enabled) return data;

    const { state } = filterState.filters;
    if (state) {
      return data.filter(d => d.state === state);
    }
    return data;
  }, [data, filterState]);

  const handleRowClick = (facilityName: string) => {
    setSelection('questao1.1', [facilityName]);
  };

  const isHighlighted = (facilityName: string) => {
    if (selection.length === 0) return true;
    return selection.includes(facilityName);
  };

  const avgInfection = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((sum, row) => sum + row.score_avg_infection, 0);
    return total / filteredData.length;
  }, [filteredData]);

  const avgEficacia = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((sum, row) => sum + row.score_avg_eficacia, 0);
    return total / filteredData.length;
  }, [filteredData]);

  if (loading) {
    return <div className={`questao1-1-loading ${className}`}>Loading...</div>;
  }

  return (
    <div className={`questao1-1-container ${className}`}>
      <table className="questao1-1-table">
        <thead>
          <tr>
            <th>Facility Name</th>
            <th>City</th>
            <th>State</th>
            <th>Infection Score</th>
            <th>Eficacia Score</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(row => (
            <tr
              key={row.facility_name}
              className={isHighlighted(row.facility_name) ? 'highlighted' : 'dimmed'}
              onClick={() => handleRowClick(row.facility_name)}
            >
              <td>{row.facility_name}</td>
              <td>{row.city}</td>
              <td>{row.state}</td>
              <td>{row.score_avg_infection.toFixed(2)}</td>
              <td>{row.score_avg_eficacia.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="summary-row">
            <td colSpan={3}>
              <strong>Average</strong>
            </td>
            <td>
              <strong>{avgInfection.toFixed(2)}</strong>
            </td>
            <td>
              <strong>{avgEficacia.toFixed(2)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
