import React, { useState } from 'react';
import {
  Badge,
  Button,
  Popover,
  Divider,
  Empty,
  List,
  Typography,
  Space,
} from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const { Text, Title } = Typography;

const CartIcon = () => {
  const navigate = useNavigate();
  const { cart, loading } = useCart();
  const [popoverVisible, setPopoverVisible] = useState(false); // 👈 state điều khiển popover

  const itemCount = cart?.items?.length || 0;

  const handleViewCart = () => {
    setPopoverVisible(false); // 👈 Đóng popover trước
    navigate('/cart');
  };

  const handleCheckout = () => {
    setPopoverVisible(false); // 👈 Đóng popover trước
    navigate('/checkout');
  };

  const cartContent = () => {
    if (loading || !cart) {
      return <div style={{ padding: 16 }}>Loading cart...</div>;
    }

    if (!cart?.items?.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Your cart is empty"
          className="my-4"
        />
      );
    }

    return (
      <div style={{ width: 300 }}>
        <List
          itemLayout="horizontal"
          dataSource={cart.items.slice(0, 3)}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <img
                    src={item.image || 'https://via.placeholder.com/40'}
                    alt={item.name}
                    style={{ width: 40, height: 40, objectFit: 'cover' }}
                  />
                }
                title={<Text ellipsis>{item.name}</Text>}
                description={`${item.quantity} × ${new Intl.NumberFormat(
                  'vi-VN',
                  { style: 'currency', currency: 'VND' }
                ).format(item.unit_price)}`}
              />
              <div>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(item.total_price)}
              </div>
            </List.Item>
          )}
        />

        {cart.items.length > 3 && (
          <div className="text-center my-2">
            <Text type="secondary">
              +{cart.items.length - 3} more item
              {cart.items.length - 3 > 1 ? 's' : ''}
            </Text>
          </div>
        )}

        <Divider className="my-2" />

        <div className="flex justify-between mb-2">
          <Text>Subtotal:</Text>
          <Text strong>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(cart.subtotal || 0)}
          </Text>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} className="mt-3">
          <Button type="primary" block onClick={handleViewCart}>
            View Cart
          </Button>
          <Button block onClick={handleCheckout}>
            Checkout
          </Button>
        </Space>
      </div>
    );
  };

  if (loading) {
    return (
      <Button
        type="text"
        shape="circle"
        icon={<ShoppingCartOutlined className="text-gray-400 text-xl animate-pulse" />}
        disabled
      />
    );
  }

  return (
    <Popover
      content={cartContent}
      title={<Title level={5} className="m-0">Shopping Cart</Title>}
      trigger="click"
      placement="bottomRight"
      overlayClassName="cart-popover"
      open={popoverVisible}
      onOpenChange={setPopoverVisible} // 👈 kiểm soát đóng/mở
    >
      <Badge count={itemCount} showZero={false} overflowCount={99}>
        <Button
          type="text"
          shape="circle"
          icon={<ShoppingCartOutlined className="text-gray-600 text-xl" />}
        />
      </Badge>
    </Popover>
  );
};

export default CartIcon;
