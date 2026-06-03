import { useState, useEffect } from 'react';
import type { TablePaginationConfig } from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

type TableParams<T> = {
  pagination?: TablePaginationConfig;
  filters?: Record<string, FilterValue | null>;
  sorter?: SorterResult<T> | SorterResult<T>[];
};

export const useTable = <T extends object>(initialData: T[], defaultPageSize = 10) => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams<T>>({
    pagination: {
      current: 1,
      pageSize: defaultPageSize,
    },
  });

  const fetchData = () => {
    setLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      const { current = 1, pageSize = defaultPageSize } = tableParams.pagination || {};
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      setData(initialData.slice(start, end));
      setLoading(false);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: initialData.length,
        },
      });
    }, 300);
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[],
  ) => {
    setTableParams({
      pagination,
      filters,
      sorter,
    });
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams)]);

  return {
    data,
    loading,
    tableParams,
    handleTableChange,
    refresh: fetchData,
  };
};
