import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { ClusterProfiles } from './components/dashboards/ClusterProfiles';
import { ModelPerformance } from './components/dashboards/ModelPerformance';
import { loadAllData } from './services/dataService';
import type { ModelPerformanceRow, ClusterProfileRow } from './types';

import './App.css';

function App() {
  const [modelPerformanceData, setModelPerformanceData] = useState<ModelPerformanceRow[]>([])
  const [clusterProfileData, setClusterProfileData] = useState<ClusterProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await loadAllData()
        setModelPerformanceData(data.modelPerformance)
        setClusterProfileData(data.clusterProfiles)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load data. Please check the console for details.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#666',
      }}>
        Loading dashboard data...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#e15759',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '20px', fontSize: '24px' }}>⚠️ Error</div>
        <div>{error}</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div style={{
        display: 'flex',
        height: '100vh',
        fontFamily: 'sans-serif',
      }}>
        {/* Sidebar Navigation */}
        <div style={{
          width: '250px',
          backgroundColor: '#2c3e50',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #34495e',
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
            }}>
              Tableau Dashboard
            </h1>
          </div>

          <nav style={{
            flex: 1,
            padding: '20px 0',
          }}>
            <NavLink
              to="/"
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 20px',
                color: 'white',
                textDecoration: 'none',
                backgroundColor: isActive ? '#34495e' : 'transparent',
                borderLeft: isActive ? '4px solid #3498db' : '4px solid transparent',
                transition: 'all 0.2s',
              })}
              end
            >
              Model Performance
            </NavLink>

            <NavLink
              to="/cluster-profiles"
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 20px',
                color: 'white',
                textDecoration: 'none',
                backgroundColor: isActive ? '#34495e' : 'transparent',
                borderLeft: isActive ? '4px solid #3498db' : '4px solid transparent',
                transition: 'all 0.2s',
              })}
            >
              Cluster Profiles
            </NavLink>
          </nav>

          <div style={{
            padding: '20px',
            borderTop: '1px solid #34495e',
            fontSize: '12px',
            color: '#95a5a6',
          }}>
            <div>© 2024 Dashboard</div>
            <div style={{ marginTop: '5px' }}>React + TypeScript + D3</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#ecf0f1',
        }}>
          <Routes>
            <Route
              path="/"
              element={<ModelPerformance data={modelPerformanceData} />}
            />
            <Route
              path="/cluster-profiles"
              element={<ClusterProfiles data={clusterProfileData} />}
            />
            <Route
              path="*"
              element={
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  color: '#7f8c8d',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                  <div style={{ fontSize: '18px' }}>Page not found</div>
                  <Link to="/" style={{ marginTop: '20px', color: '#3498db', textDecoration: 'none' }}>
                    Go to Dashboard
                  </Link>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
