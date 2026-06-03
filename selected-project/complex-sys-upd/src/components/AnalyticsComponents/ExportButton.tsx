import React from 'react';

type ExportButtonProps = {
  onClick: () => void;
};

export default function ExportButton(props) {
  return (
    <button className="export-button" onClick={props.onClick}>
      Export Data
    </button>
  );
};

// Example CSS:
// .export-button {
//   padding: 10px 20px;
//   background-color: #3498db;
//   color: white;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
//   font-size: 14px;
//   transition: background-color 0.2s;
// }
// .export-button:hover {
//   background-color: #2980b9;
// }