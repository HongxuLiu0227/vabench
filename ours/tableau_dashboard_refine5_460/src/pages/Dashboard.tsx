import { useData } from '../hooks/useData';
import { LineChart } from '../components/LineChart';
import { HorizontalBarChart } from '../components/HorizontalBarChart';
import { Scatterplot } from '../components/Scatterplot';
import { Loading } from '../components/Loading';
import { ErrorDisplay } from '../components/ErrorDisplay';
import './Dashboard.css';

export function Dashboard() {
  const { salesByMonth, salesByYear, salesBySubCategory, scatterplotData, loading, error } =
    useData();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Synthetic Dashboard 460</h1>
        <p className="dashboard-subtitle">Superstore Orders Analysis</p>
      </header>

      <div className="dashboard-grid">
        {/* Top-left: Sales by Sub Category */}
        <div className="worksheet-container">
          <HorizontalBarChart
            data={salesBySubCategory}
            title="Sales by Sub Category"
            width={500}
            height={400}
            xAxisLabel="Sales"
            yAxisLabel="Sub-Category"
          />
        </div>

        {/* Top-right: Total Sales Each Year */}
        <div className="worksheet-container">
          <LineChart
            data={salesByYear}
            title="Total Sales Each Year"
            width={500}
            height={400}
            xAxisLabel="Year"
            yAxisLabel="Sales"
          />
        </div>

        {/* Bottom-left: Scatterplot */}
        <div className="worksheet-container">
          <Scatterplot
            data={scatterplotData}
            title="Scatterplot"
            width={500}
            height={400}
            xAxisLabel="Sales"
            yAxisLabel="Profit"
          />
        </div>

        {/* Bottom-right: Line */}
        <div className="worksheet-container">
          <LineChart
            data={salesByMonth}
            title="Line"
            width={500}
            height={400}
            xAxisLabel="Order Date"
            yAxisLabel="Sales"
          />
        </div>
      </div>
    </div>
  );
}
