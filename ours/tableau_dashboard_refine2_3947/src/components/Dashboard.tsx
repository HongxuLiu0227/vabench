import React, { useEffect, useState } from 'react';
import { Sheet1 } from './Sheet1';
import { Sheet3 } from './Sheet3';
import { Sheet4 } from './Sheet4';
import { VoteDirectionLegend } from './VoteDirectionLegend';
import { IssueAreaFilter } from './IssueAreaFilter';
import { JusticeNameFilter } from './JusticeNameFilter';
import { loadScotusData, filterData, aggregateVotesByJusticeAndDirection, aggregatePrecedentByJusticeAndIssue, aggregateCareerVotesByTerm, getAllJusticeNames } from '../services/dataService';
import { useFilters } from '../contexts/FilterContext';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilters();

  useEffect(() => {
    loadScotusData()
      .then((data) => {
        setAllData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading SCOTUS data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" role="alert" aria-live="assertive">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  const filteredData = filterData(
    allData,
    filters.issueAreas.size > 0 ? filters.issueAreas : undefined,
    filters.justiceNames.size > 0 ? filters.justiceNames : undefined,
    filters.voteDirections.size > 0 ? filters.voteDirections : undefined
  );

  const sheet1Data = aggregateVotesByJusticeAndDirection(filteredData);
  const sheet3Data = aggregatePrecedentByJusticeAndIssue(filteredData);
  const sheet4Data = aggregateCareerVotesByTerm(filteredData);

  const availableJustices = getAllJusticeNames(allData);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="sheet1-container">
          <div className="sheet1-chart">
            <Sheet1 data={sheet1Data} />
          </div>
          <div className="sheet1-legend">
            <VoteDirectionLegend />
          </div>
          <div className="sheet1-filter">
            <IssueAreaFilter />
          </div>
        </div>

        <div className="sheet3-container">
          <Sheet3 data={sheet3Data} />
          <div className="sheet3-filter">
            <JusticeNameFilter availableJustices={availableJustices} />
          </div>
        </div>

        <div className="sheet4-container">
          <Sheet4 data={sheet4Data} />
        </div>
      </div>
    </div>
  );
};
