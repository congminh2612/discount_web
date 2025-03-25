import React from 'react';
import { Card, Badge, Typography, Tag, Button, Tooltip, Rate } from 'antd';
import { HeartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { QuickAddToCart } from '@/pages/cart/components';

const { Text } = Typography;
const { Meta } = Card;

const ProductCard = ({ product, onToggleWishlist, onViewDetail, isInWishlist }) => {
  const navigate = useNavigate();
  if (!product) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getPriceDisplay = () => {
    if (product.has_variant && product.variants && product.variants.length > 0) {
      const prices = product.variants.map((variant) => variant.final_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const allPricesSame = prices.every((price) => price === minPrice);

      if (allPricesSame) {
        return (
          <div className='flex items-center gap-2'>
            <Text className='text-lg font-bold text-blue-600'>{formatCurrency(minPrice)}</Text>
          </div>
        );
      } else {
        return (
          <div className='flex items-center gap-2'>
            <Text className='text-lg font-bold text-blue-600'>From {formatCurrency(minPrice)}</Text>
          </div>
        );
      }
    }

    const hasDiscount = product.original_price > product.final_price;
    const discount = product.original_price - product.final_price;
    const discountPercent = hasDiscount ? Math.round((discount / product.original_price) * 100) : 0;

    return (
      <div className='flex items-center gap-2'>
        <Text className='text-lg font-bold text-blue-600'>{formatCurrency(product.final_price)}</Text>
        {hasDiscount && (
          <Text delete className='text-sm text-gray-500'>
            {formatCurrency(product.original_price)}
          </Text>
        )}
      </div>
    );
  };

  const hasDiscount = product.original_price > product.final_price;
  const discount = product.original_price - product.final_price;
  const discountPercent = hasDiscount ? Math.round((discount / product.original_price) * 100) : 0;

  return (
    <Badge.Ribbon text={`-${discountPercent}%`} color='red' style={{ display: hasDiscount ? 'block' : 'none' }}>
      <Card
        hoverable
        className='overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg h-full'
        style={{ display: 'flex', flexDirection: 'column' }}
        cover={
          <div className='relative h-64 overflow-hidden bg-gray-100'>
            <img
              alt={product.name}
              src={product.image_url || 'https://via.placeholder.com/300'}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300?text=No+Image';
              }}
              onClick={() => navigate(`/product/${product.id}`)}
            />
            <div className='absolute inset-0 bg-black bg-opacity-0 opacity-0 hover:bg-opacity-20 hover:opacity-100 transition-all duration-300 flex items-center justify-center'>
              <div className='flex gap-2'>
                <Tooltip title='View details'>
                  <Button
                    shape='circle'
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className='bg-white hover:bg-blue-500 hover:text-white'
                  />
                </Tooltip>
                <Tooltip title='Add to wishlist'>
                  <Button
                    shape='circle'
                    icon={<HeartOutlined />}
                    onClick={() => onToggleWishlist(product)}
                    className={`${isInWishlist ? 'bg-red-100 text-red-500' : 'bg-white'} hover:bg-red-500 hover:text-white`}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        }
        actions={[
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/product/${product.id}`)}
          >
            Details
          </Button>,
          <QuickAddToCart product={product} />
        ]}
        bodyStyle={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}
      >
        <Meta
          title={
            <div className='font-medium text-base truncate' title={product.name}>
              {product.name}
            </div>
          }
          description={
            <div className='space-y-2 flex-grow' style={{ minHeight: '120px' }}>
              <div className='flex items-center'>
                <Rate disabled defaultValue={4} className='text-xs text-yellow-500' />
                <Text className='ml-2 text-xs text-gray-500'>(120)</Text>
              </div>

              <div className='flex flex-wrap gap-1'>
                {product.has_variant && <Tag color='blue'>Multiple versions</Tag>}
                {product.stock_quantity <= 5 && <Tag color='red'>Low stock</Tag>}
                {product.category?.name && <Tag color='green'>{product.category.name}</Tag>}
              </div>

              <div className='mt-auto pt-2'>{getPriceDisplay()}</div>
            </div>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;
