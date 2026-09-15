import { useData } from '../hooks/useData';
import { LineChart } from './LineChart';
import { ScatterPlot } from './ScatterPlot';
import { RegionalTable } from './RegionalTable';

export function Dashboard() {
  const { salesByMonth, salesByYear, regionalMetrics, scatterData, loading, error } =
    useData();

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading" role="status" aria-live="polite">
          <svg
            className="spinner"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#333"
              strokeWidth="3"
              strokeDasharray="80"
              strokeDashoffset="60"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 20 20"
                to="360 20 20"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div
          className="error"
          role="alert"
          aria-live="assertive"
        >
          <strong>Error loading dashboard:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* 2x2 Grid Layout based on Tableau zones */}
      <div className="dashboard-grid">
        {/* Top-left: P121__line */}
        <div className="worksheet-zone zone-top-left">
          <LineChart
            data={salesByMonth.map((d) => ({
              month: d.month,
              sales: d.sales,
            }))}
            title="Line"
            width={450}
            height={320}
            timeAxis={true}
          />
        </div>

        {/* Top-right: P1225__total_sales_each_year */}
        <div className="worksheet-zone zone-top-right">
          <LineChart
            data={salesByYear.map((d) => ({
              year: d.year,
              sales: d.sales,
            }))}
            title="Total Sales Each Year"
            width={450}
            height={320}
            timeAxis={false}
          />
        </div>

        {/* Bottom-left: P2648__discount_overview_by_region */}
        <div className="worksheet-zone zone-bottom-left">
          <RegionalTable data={regionalMetrics} title="Discount Overview by Region" />
        </div>

        {/* Bottom-right: P121__scatterplot */}
        <div className="worksheet-zone zone-bottom-right">
          <ScatterPlot data={scatterData} title="Scatterplot" width={450} height={320} />
        </div>
      </div>
    </div>
  );
}
