import { Card } from 'antd';
import { useDrop } from 'react-dnd';
import DealCard from './DealCard';
import type { DealStage } from './types';
import './DealColumn.css';

interface DealColumnProps {
  stage: DealStage;
}

const DealColumn = ({ stage }: DealColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'deal',
    drop: () => ({ stageId: stage.id }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`deal-column ${isOver ? 'deal-column-over' : ''}`}>
      <Card
        title={stage.title}
        headStyle={{ backgroundColor: stage.color, color: 'white' }}
        bodyStyle={{ padding: 0 }}
      >
        <DealCard id="1" title="New Website" value={5000} />
        <DealCard id="2" title="Marketing Campaign" value={10000} />
      </Card>
    </div>
  );
};

export default DealColumn;