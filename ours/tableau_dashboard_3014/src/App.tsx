import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InteractionProvider } from './services/interactionContext';
import { Dashboard } from './components/dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <InteractionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </InteractionProvider>
  );
}

export default App;
