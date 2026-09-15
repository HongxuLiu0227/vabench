import { GENDER_COLORS } from '../types';
import type { GenderText } from '../types';

interface GenderLegendProps {
  selectedGender: GenderText | null;
  onGenderClick: (gender: GenderText | null) => void;
}

const GenderLegend = ({ selectedGender, onGenderClick }: GenderLegendProps) => {
  const genders: GenderText[] = ['Female', 'Male', 'Unknown'];

  return (
    <div className="gender-legend">
      <div className="legend-title">Gender</div>
      {genders.map(gender => (
        <div
          key={gender}
          className={`legend-item ${selectedGender && selectedGender !== gender ? 'dimmed' : ''} ${selectedGender === gender ? 'selected' : ''}`}
          onClick={() => onGenderClick(selectedGender === gender ? null : gender)}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="legend-color"
            style={{ backgroundColor: GENDER_COLORS[gender] }}
          />
          <span className="legend-label">{gender}</span>
        </div>
      ))}
    </div>
  );
};

export default GenderLegend;
