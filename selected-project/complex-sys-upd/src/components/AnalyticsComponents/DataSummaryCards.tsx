import React from 'react';

type SummaryCard = {
  title: string;
  value: number;
};

type DataSummaryCardsProps = {
  data: SummaryCard[];
};

export default function DataSummaryCards(props) {
  return (
    <div className="summary-cards">
      {props.data.map((card, index) => (
        <div key={index} className="summary-card">
          <h3>{card.title}</h3>
          <p>{card.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

// Example CSS:
// .summary-cards {
//   display: grid;
//   grid-template-columns: repeat(4, 1fr);
//   gap: 20px;
// }
// .summary-card {
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
//   box-shadow: 0 2px 5px rgba(0,0,0,0.1);
// }
// .summary-card h3 {
//   margin: 0 0 10px 0;
//   font-size: 16px;
//   color: #7f8c8d;
// }
// .summary-card p {
//   margin: 0;
//   font-size: 24px;
//   font-weight: bold;
//   color: #2c3e50;
// }