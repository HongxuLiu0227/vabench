import { Card } from 'antd';
import { useDrag } from 'react-dnd';
import './DealCard.css';

interface DealCardProps {
  id: string;
  title: string;
  value: number;
}

const DealCard = ({ id, title, value }: DealCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'deal',
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="deal-card" size="small">
        <div>{title}</div>
        <div>${value.toLocaleString()}</div>
      </Card>
    </div>
  );
};

export default DealCard;