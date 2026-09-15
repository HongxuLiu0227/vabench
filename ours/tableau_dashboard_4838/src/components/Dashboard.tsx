import type { TelcoRecord } from '../types';
import { HorizontalRankedBar } from './HorizontalRankedBar';
import { PieChart } from './PieChart';
import { CustomTableView } from './CustomTableView';

interface DashboardProps {
  data: TelcoRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#f28e2b', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          Telco Customer Churn
        </h1>
        <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
          Customer attrition, also known as customer churn, or customer defection, is the loss of customers
        </p>
      </div>

      {/* Customer Demographics Section */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#4e79a7', fontSize: '15px', fontWeight: 'bold', marginBottom: '15px' }}>
          Customer Demographics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="gender" />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="Partner" categoryOrder={['Yes', 'No']} />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="Dependents" categoryOrder={['Yes', 'No']} />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <CustomTableView data={data} type="citizen" />
          </div>
        </div>
      </div>

      {/* Contract & Services Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="MultipleLines" categoryOrder={['Yes', 'No', 'No phone service']} />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="Contract" />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="InternetService" />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="PaymentMethod" />
          </div>
        </div>
      </div>

      {/* Managed Services Usage Section */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#4e79a7', fontSize: '15px', fontWeight: 'bold', marginBottom: '15px' }}>
          Managed Services Usage
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="DeviceProtection" title="<Sheet Name>" />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="OnlineBackup" title="Online Backup" />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="OnlineSecurity" title="Online Security" />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="TechSupport" title="Tech Support" />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="StreamingTV" title="Streaming TV" />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <HorizontalRankedBar data={data} dimension="StreamingMovies" title="Streaming Movies" />
          </div>
        </div>
      </div>

      {/* Churn & Phone Service Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <h3 style={{ color: '#4e79a7', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>
              Churn Rate
            </h3>
            <p style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
              <span style={{ color: '#f28e2b', fontWeight: 'bold' }}>Orange</span> indicates customers lost
            </p>
            <PieChart
              data={data}
              dimension="Churn"
              centerText={{
                label: 'Total Customer',
                value: data.length.toLocaleString(),
              }}
            />
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '10px' }}>
            <h3 style={{ color: '#4e79a7', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>
              Phone Service Usage
            </h3>
            <p style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
              <span style={{ color: '#f28e2b', fontWeight: 'bold' }}>Orange</span> indicates customers not using service
            </p>
            <PieChart
              data={data}
              dimension="PhoneService"
              centerText={{
                label: 'Total Customer',
                value: data.length.toLocaleString(),
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Project Data Source:{' '}
          <span style={{ color: '#b6992d', fontWeight: 'bold' }}>Kaggle</span>
        </p>
      </div>
    </div>
  );
};
