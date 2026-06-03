import React, { useState } from 'react';
import { DateRange, Range } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

type DateRangePickerProps = {
  initialRange: {
    start: Date;
    end: Date;
  };
  onChange: (range: { start: Date; end: Date }) => void;
};

export default function DateRangePicker(props) {
  const [state, setState] = useState<Range[]>([
    {
      startDate: initialRange.start,
      endDate: initialRange.end,
      key: 'selection'
    }
  ]);

  const handleChange = (item: any) => {
    setState([item.selection]);
    onChange({
      start: item.selection.startDate,
      end: item.selection.endDate
    });
  };

  return (
    <div className="date-range-picker">
      <DateRange
        editableDateInputs={true}
        onChange={handleChange}
        moveRangeOnFirstSelection={false}
        ranges={state}
      />
    </div>
  );
};