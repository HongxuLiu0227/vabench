import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Button } from './components/Button';
import CustomersPage from './features/customers/CustomersPage';
import MainLayout from './features/layout/MainLayout';
import DealsPage from './features/deals/DealsPage';
import TasksPage from './features/tasks/TasksPage';
import LoginPage from './features/auth/LoginPage';

function App() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="/" element={<MainLayout />}>
        <Route path="customers" element={<CustomersPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="tasks" element={<TasksPage />} />
      </Route>
      <Route path="*" element={<div style={{ padding: '2rem' }}><h1>404 - Page Not Found</h1></div>} />
    </Routes>
  );
}

export default App;