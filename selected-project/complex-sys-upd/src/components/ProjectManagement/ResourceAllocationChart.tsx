import React from 'react';

const ResourceAllocationChart: React.FC<{ resources?: any[] }> = ({ resources = [] }) => (
  <div>Resource Allocation Chart Placeholder ({resources.length} resources)</div>
);

export default ResourceAllocationChart; 