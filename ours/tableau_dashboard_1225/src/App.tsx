import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useData } from './hooks/useData';
import { Dashboard, Loading, Error } from './components';

function App() {
  const { data, loading, error } = useData();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard data={data} />} />
        <Route path="/dashboard" element={<Dashboard data={data} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
