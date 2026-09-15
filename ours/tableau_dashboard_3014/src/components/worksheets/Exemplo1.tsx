import { useEffect, useState, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import type { FacilityWithMeasures } from '../../types';
import { useInteraction } from '../../hooks/useInteraction';
import './Exemplo1.css';

interface Exemplo1Props {
  className?: string;
}

export function Exemplo1({ className = '' }: Exemplo1Props) {
  const [data, setData] = useState<FacilityWithMeasures[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSelection, setSelection } = useInteraction();

  const selection = useMemo(() => getSelection('Exemplo1'), [getSelection]);

  useEffect(() => {
    async function loadData() {
      await dataService.loadData();
      const facilities = dataService.getFacilitiesWithMeasures();
      setData(facilities);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleRowClick = (facilityName: string) => {
    setSelection('Exemplo1', [facilityName]);
  };

  const isHighlighted = (facilityName: string) => {
    if (selection.length === 0) return true;
    return selection.includes(facilityName);
  };

  if (loading) {
    return <div className={`exemplo1-loading ${className}`}>Loading...</div>;
  }

  return (
    <div className={`exemplo1-container ${className}`}>
      <table className="exemplo1-table">
        <thead>
          <tr>
            <th>Facility Name</th>
            <th>Measure Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.flatMap(facility =>
            facility.measures.map((measure, idx) => (
              <tr
                key={`${facility.facility_name}-${idx}`}
                className={isHighlighted(facility.facility_name) ? 'highlighted' : 'dimmed'}
                onClick={() => handleRowClick(facility.facility_name)}
              >
                {idx === 0 ? (
                  <td rowSpan={facility.measures.length}>{facility.facility_name}</td>
                ) : null}
                <td>{measure.measure_name}</td>
                <td>{measure.value.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
