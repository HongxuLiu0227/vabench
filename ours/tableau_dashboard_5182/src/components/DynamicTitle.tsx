import React from 'react';
import type { SelectedSchool } from '../types';
import './DynamicTitle.css';

interface DynamicTitleProps {
  selectedSchool: SelectedSchool;
}

const DynamicTitle: React.FC<DynamicTitleProps> = ({ selectedSchool }) => {
  const titleText = selectedSchool
    ? `How ${selectedSchool}'s Fight Song Stacks Up`
    : 'How College Fight Songs Stack Up';

  return (
    <div className="dynamic-title">
      <h1 className="title-text">{titleText}</h1>
    </div>
  );
};

export default DynamicTitle;
