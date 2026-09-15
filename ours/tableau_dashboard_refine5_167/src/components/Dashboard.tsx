import { BarWorksheet } from './worksheets/BarWorksheet';
import { SalesBySubCategoryWorksheet } from './worksheets/SalesBySubCategoryWorksheet';
import { TotalSalesEachYearWorksheet } from './worksheets/TotalSalesEachYearWorksheet';
import { ScatterPlotWorksheet } from './worksheets/ScatterPlotWorksheet';

export const Dashboard: React.FC = () => {
  // Calculate dimensions based on zone specifications
  // The dashboard is 100000x100000 units, we'll scale to viewport
  // Each worksheet is approximately 49407x48950 units

  const worksheetWidth = 494;
  const worksheetHeight = 400;

  return (
    <div
      style={{
        padding: '8px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '8px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '4px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {/* Top-left: Sales by Sub Category */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            padding: '4px',
            backgroundColor: 'white',
          }}
        >
          <SalesBySubCategoryWorksheet
            width={worksheetWidth}
            height={worksheetHeight}
          />
        </div>

        {/* Top-right: Scatterplot */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            padding: '4px',
            backgroundColor: 'white',
          }}
        >
          <ScatterPlotWorksheet
            width={worksheetWidth}
            height={worksheetHeight}
          />
        </div>

        {/* Bottom-left: Total Sales Each Year */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            padding: '4px',
            backgroundColor: 'white',
          }}
        >
          <TotalSalesEachYearWorksheet
            width={worksheetWidth}
            height={worksheetHeight}
          />
        </div>

        {/* Bottom-right: Bar */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            padding: '4px',
            backgroundColor: 'white',
          }}
        >
          <BarWorksheet
            width={worksheetWidth}
            height={worksheetHeight}
          />
        </div>
      </div>
    </div>
  );
};
