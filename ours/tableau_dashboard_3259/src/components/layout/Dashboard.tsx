import { useEffect, useState, useCallback } from 'react';
import type { TwitterData } from '../../types';
import { loadTwitterData, filterData } from '../../services/dataService';
import { useFilters } from '../../contexts/FilterContext';
import * as Worksheets from '../worksheets';
import './Dashboard.css';

interface DashboardProps {
  onLoadingChange?: (loading: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLoadingChange }) => {
  const [allData, setAllData] = useState<TwitterData[]>([]);
  const [filteredData, setFilteredData] = useState<TwitterData[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters, setUserFilter, setPostFilter, setDateFilter, clearAllFilters } = useFilters();

  useEffect(() => {
    const loadData = async () => {
      try {
        onLoadingChange?.(true);
        const data = await loadTwitterData();
        setAllData(data);
        setFilteredData(data);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    };
    loadData();
  }, [onLoadingChange]);

  useEffect(() => {
    const filtered = filterData(
      allData,
      filters.selectedUser,
      filters.selectedPost,
      filters.selectedDate
    );
    setFilteredData(filtered);
  }, [allData, filters]);

  const handleUserClick = useCallback((userUrl: string) => {
    setUserFilter(userUrl);
  }, [setUserFilter]);

  const handlePostClick = useCallback((postUrl: string) => {
    setPostFilter(postUrl);
  }, [setPostFilter]);

  const handleDateClick = useCallback((date: Date) => {
    setDateFilter(date);
  }, [setDateFilter]);

  const handleClearFilters = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Loading data...</div>
      </div>
    );
  }

  const hasActiveFilter = filters.selectedUser || filters.selectedPost || filters.selectedDate;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Twitterデータの可視化</h1>
        {hasActiveFilter && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            フィルターをクリア
          </button>
        )}
      </header>

      <div className="dashboard-grid">
        {/* Row 1: KPIs */}
        <div className="dashboard-card kpi-card">
          <Worksheets.SearchWord data={filteredData} />
        </div>
        <div className="dashboard-card kpi-card">
          <Worksheets.CollectedData data={filteredData} />
        </div>
        <div className="dashboard-card kpi-card">
          <Worksheets.DataCount data={filteredData} />
        </div>

        {/* Row 2: User Post Ranking */}
        <div className="dashboard-card full-width">
          <Worksheets.UserPostRanking data={filteredData} onUserClick={handleUserClick} />
        </div>

        {/* Row 3: Likes */}
        <div className="dashboard-card half-width">
          <Worksheets.LikesCount data={filteredData} />
        </div>
        <div className="dashboard-card half-width">
          <Worksheets.LikesDaily data={filteredData} onDateClick={handleDateClick} />
        </div>

        {/* Row 4: Retweets */}
        <div className="dashboard-card half-width">
          <Worksheets.RetweetCount data={filteredData} />
        </div>
        <div className="dashboard-card half-width">
          <Worksheets.RetweetDaily data={filteredData} onDateClick={handleDateClick} />
        </div>

        {/* Row 5: Comments */}
        <div className="dashboard-card half-width">
          <Worksheets.CommentsCount data={filteredData} />
        </div>
        <div className="dashboard-card half-width">
          <Worksheets.CommentsDaily data={filteredData} onDateClick={handleDateClick} />
        </div>
      </div>

      {/* Detail Views - Only shown when filtered */}
      {filters.selectedUser && (
        <div className="dashboard-section">
          <h2>ユーザー詳細</h2>
          <div className="dashboard-grid">
            <div className="dashboard-card full-width">
              <Worksheets.LikesByUser data={filteredData} onUserClick={handleUserClick} />
            </div>
            <div className="dashboard-card full-width">
              <Worksheets.RetweetByUser data={filteredData} onUserClick={handleUserClick} />
            </div>
            <div className="dashboard-card full-width">
              <Worksheets.CommentsByUser data={filteredData} onUserClick={handleUserClick} />
            </div>
          </div>
        </div>
      )}

      {filters.selectedPost && (
        <div className="dashboard-section">
          <h2>投稿詳細</h2>
          <div className="dashboard-grid">
            <div className="dashboard-card full-width">
              <Worksheets.LikesByPost data={filteredData} onPostClick={handlePostClick} />
            </div>
            <div className="dashboard-card full-width">
              <Worksheets.RetweetByPost data={filteredData} onPostClick={handlePostClick} />
            </div>
            <div className="dashboard-card full-width">
              <Worksheets.CommentsByPost data={filteredData} onPostClick={handlePostClick} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
