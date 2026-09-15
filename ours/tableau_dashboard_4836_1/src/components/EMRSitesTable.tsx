/**
 * EMR Sites Table View
 * Hierarchical view: County > Partner > Facility
 *
 * Chart Type: custom_tableau_view
 * Shows facilities grouped by county and partner with upload status indicators
 */

import { useState, useMemo } from 'react';
import type { FacilityData, UploadStatusCategory } from '../types';
import { groupFacilitiesByCountyAndPartner } from '../utils/calculations';

interface EMRSitesTableProps {
  facilities: FacilityData[];
  selectedCategories?: UploadStatusCategory[];
}

// Color encoding for upload status
function getStatusColor(status: UploadStatusCategory): string {
  switch (status) {
    case 'CT & PKVs Uploaded':
      return '#4caf50';
    case 'Only CT Uploaded; No PKVs':
      return '#ff9800';
    case 'Not Uploaded this month':
      return '#f44336';
    case 'Never Uploaded to DWH':
      return '#9e9e9e';
    default:
      return '#cccccc';
  }
}

// Collapsible section component
interface CollapsibleSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  count,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
        style={{ backgroundColor: isOpen ? '#f5f5f5' : 'transparent' }}
      >
        <span className="font-semibold text-sm">
          {title} <span className="text-gray-500 font-normal">({count})</span>
        </span>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="px-3 py-2">{children}</div>}
    </div>
  );
};

export const EMRSitesTable: React.FC<EMRSitesTableProps> = ({
  facilities,
  selectedCategories = [],
}) => {
  // Filter facilities by selected categories
  const filteredFacilities = useMemo(() => {
    if (selectedCategories.length === 0) return facilities;
    return facilities.filter((f) => selectedCategories.includes(f.calculatedStatus));
  }, [facilities, selectedCategories]);

  // Group by county and partner
  const groupedFacilities = useMemo(
    () => groupFacilitiesByCountyAndPartner(filteredFacilities),
    [filteredFacilities]
  );

  // Group by county for top-level grouping
  const countyGroups = useMemo(() => {
    const countyMap = new Map<string, typeof groupedFacilities>();
    groupedFacilities.forEach((group) => {
      if (!countyMap.has(group.county)) {
        countyMap.set(group.county, []);
      }
      countyMap.get(group.county)!.push(group);
    });
    return Array.from(countyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [groupedFacilities]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="emr-sites-table" style={{ maxHeight: '600px', overflowY: 'auto' }}>
      {/* Header */}
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-700">
          <div className="col-span-3">Facility Name</div>
          <div className="col-span-1">MFL Code</div>
          <div className="col-span-2">Partner</div>
          <div className="col-span-3">Upload Status</div>
          <div className="col-span-2">Latest CT Upload</div>
          <div className="col-span-1">Recency</div>
        </div>
      </div>

      {/* Data rows grouped by county and partner */}
      {countyGroups.map(([county, partnerGroups]) => (
        <CollapsibleSection
          key={county}
          title={county}
          count={partnerGroups.reduce((sum, pg) => sum + pg.facilities.length, 0)}
          defaultOpen={true}
        >
          <div className="ml-2">
            {partnerGroups.map(({ partner, facilities: groupFacilities }) => (
              <CollapsibleSection
                key={`${county}-${partner}`}
                title={partner}
                count={groupFacilities.length}
                defaultOpen={false}
              >
                <div className="ml-2">
                  {groupFacilities.map((facility) => (
                    <div
                      key={facility.DisplayMFL}
                      className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-100 text-xs hover:bg-gray-50"
                    >
                      <div className="col-span-3 font-medium truncate" title={facility.DisplayFacilityName}>
                        {facility.DisplayFacilityName}
                      </div>
                      <div className="col-span-1 text-gray-600">{facility.DisplayMFL}</div>
                      <div className="col-span-2 text-gray-600 truncate" title={facility.DisplayMechanism}>
                        {facility.DisplayMechanism}
                      </div>
                      <div className="col-span-3">
                        <span
                          className="inline-block px-2 py-1 rounded text-white text-xs font-medium"
                          style={{
                            backgroundColor: getStatusColor(facility.calculatedStatus),
                          }}
                        >
                          {facility.calculatedStatus}
                        </span>
                      </div>
                      <div className="col-span-2 text-gray-600">
                        {formatDate(facility.UploadDate)}
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`text-xs font-medium ${
                            facility.recency === 'Good'
                              ? 'text-green-700'
                              : facility.recency === 'Average'
                                ? 'text-orange-700'
                                : 'text-red-700'
                          }`}
                        >
                          {facility.recency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            ))}
          </div>
        </CollapsibleSection>
      ))}

      {filteredFacilities.length === 0 && (
        <div className="px-3 py-8 text-center text-gray-500">
          No facilities match the current filter
        </div>
      )}
    </div>
  );
};

export default EMRSitesTable;
