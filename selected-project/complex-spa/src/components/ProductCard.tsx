import React from 'react';
import { Card, Button } from 'antd';

interface ProductCardProps {
  image: string;
  title: string;
  description: string;
  price: number;
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  image, 
  title, 
  description, 
  price, 
  onAddToCart 
}) => {
  return (
    <Card
      hoverable
      cover={<img alt={title} src={image || 'https://via.placeholder.com/150'} height={140} style={{ objectFit: 'cover' }} />}
      actions={[
        <Button type="primary" onClick={onAddToCart} key="add-to-cart">
          Add to Cart
        </Button>
      ]}
    >
      <Card.Meta
        title={title || 'Product Name'}
        description={description || 'Product description'}
      />
      <div style={{ marginTop: '16px', fontWeight: 'bold' }}>
        ${price.toFixed(2)}
      </div>
    </Card>
  );
};

export default ProductCard;