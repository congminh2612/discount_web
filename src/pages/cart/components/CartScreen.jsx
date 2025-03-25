import React, { useState } from 'react';
import { Typography, Button, Checkbox, Divider, Row, Col, Card, Input, message, Spin, Empty, Space, Modal, InputNumber } from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  MessageOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const discountSchema = z.object({
  discountCode: z.string().min(1, 'Please enter a discount code')
});

const noteSchema = z.object({
  orderNote: z.string().optional()
});

const CartScreen = () => {
  const navigate = useNavigate();
  const { cart, loading, error, updateItem, removeItem, applyDiscountCode, removeDiscountCode, clearAllItems } = useCart();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [selectedItems, setSelectedItems] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const {
    control: discountControl,
    handleSubmit: handleDiscountSubmit,
    formState: { errors: discountErrors },
    reset: resetDiscountForm
  } = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      discountCode: ''
    }
  });

  const {
    control: noteControl,
    handleSubmit: handleNoteSubmit,
    formState: { errors: noteErrors }
  } = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      orderNote: ''
    }
  });

  const onDiscountSubmit = async (data) => {
    try {
      await applyDiscountCode(data.discountCode);
      resetDiscountForm();
    } catch (error) {
      message.error('Failed to apply discount code');
    }
  };

  const onNoteSubmit = (data) => {
    message.success('Order note saved');
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(cart?.items.map(item => item.id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  const allSelected = cart?.items?.length > 0 && selectedItems.length === cart.items.length;

  const handleQuantityChange = (itemId, newQuantity) => {
    const item = cart.items.find(i => i.id === itemId);
    if (!item) return;
  
    const validQuantity = Math.max(1, Math.min(newQuantity, item.stock_quantity || 99));
    updateItem(itemId, validQuantity);
  };
  
  const handleRemoveItem = (item) => {
    if (!item?.id) {
      console.warn('❗ Tried to remove cart item with invalid id:', item);
      message.error('Không thể xóa sản phẩm không hợp lệ');
      return;
    }
    console.log('🧹 Try to remove cart item with ID:', item?.id);

    removeItem(item.id);
  };
  
  const handleCheckout = () => {
    if (!currentUser) {
      message.warning('Please sign in to proceed to checkout');
      navigate('/sign-in');
      return;
    }
    
    if (!cart || cart.items.length === 0) {
      message.warning('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  const handleRemoveDiscount = async () => {
    try {
      await removeDiscountCode();
    } catch (error) {
      message.error('Failed to remove discount code');
    }
  };

  const handleClearCart = () => {
    if (!cart || cart.items.length === 0) {
      message.info('Your cart is already empty');
      return;
    }

    clearAllItems();
    message.success('Cart cleared');
  };

  if (loading && !cart) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        <p className="mt-4 text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              Failed to load cart data.
              <br />
              <Button type="primary" onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </span>
          }
        />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Empty
          image={<ShoppingOutlined style={{ fontSize: 64 }} />}
          description={
            <div className="space-y-4">
              <Text className="text-lg">Your cart is empty</Text>
              <p className="text-gray-500">Looks like you haven't added any products to your cart yet.</p>
              <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/products')}
                className="mt-4"
              >
                Continue Shopping
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-0 flex items-center">
          <ShoppingCartOutlined className="mr-2" />
          Your Shopping Cart
        </Title>
        <Button type="text" danger onClick={handleClearCart} loading={confirmLoading}>
          Clear Cart
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card>
            <div className="flex items-center mb-4">
              <Checkbox 
                checked={allSelected} 
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="mr-2"
              >
                Select All
              </Checkbox>
              <Text className="text-gray-500 ml-auto">
                {selectedItems.length} of {cart.items.length} items selected
              </Text>
            </div>

            {cart.items.map((item) => (
              <div key={item.id} className="flex py-4 border-t">
                <Checkbox 
                  checked={selectedItems.includes(item.id)} 
                  onChange={() => toggleItemSelection(item.id)}
                  className="mr-4 self-center"
                />

                <img 
                  src={item.image || 'https://via.placeholder.com/150'} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover mr-4 rounded"
                />

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="mb-2 md:mb-0">
                      <Text strong className="text-lg">{item.name}</Text>
                      {item.variant_id && (
                        <div className="text-sm text-gray-500">
                          {/* Show variant attributes if available */}
                          {item.attributes ? 
                            Object.entries(item.attributes).map(([key, value]) => 
                              `${key}: ${value}`
                            ).join(', ') 
                            : 'Variant'}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Unit Price: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unit_price)}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <Button 
                          icon={<MinusOutlined />} 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          size="small"
                          className="mr-1"
                        />
                        <InputNumber
                          min={1}
                          max={item.stock_quantity || 99}
                          value={item.quantity}
                          onChange={(value) => handleQuantityChange(item.id, value)}
                          className="w-14 text-center"
                          controls={false}
                        />
                        <Button 
                          icon={<PlusOutlined />} 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.stock_quantity || 99)}
                          size="small"
                          className="ml-1"
                        />
                      </div>

                      <Text strong className="text-base mr-4 min-w-[80px] text-right">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total_price)}
                      </Text>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          <Card className="mt-4">
            <form onSubmit={handleNoteSubmit(onNoteSubmit)}>
              <div className="flex items-center mb-3">
                <MessageOutlined className="mr-2 text-blue-500" />
                <Typography.Title level={5} className="mb-0">
                  Order Notes
                </Typography.Title>
              </div>
              <Controller
                name="orderNote"
                control={noteControl}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    rows={4}
                    placeholder="Add any special instructions or notes for your order"
                    maxLength={500}
                    showCount
                  />
                )}
              />
              {noteErrors.orderNote && (
                <Text type="danger">{noteErrors.orderNote.message}</Text>
              )}
              <div className="flex justify-end mt-3">
                <Button type="primary" htmlType="submit">
                  Save Note
                </Button>
              </div>
            </form>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="mb-4">
            <form onSubmit={handleDiscountSubmit(onDiscountSubmit)}>
              <div className="flex items-center mb-3">
                <TagOutlined className="mr-2 text-blue-500" />
                <Typography.Title level={5} className="mb-0">
                  Discount Code
                </Typography.Title>
              </div>
              <Space.Compact style={{ width: '100%' }}>
                <Controller
                  name="discountCode"
                  control={discountControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter discount code"
                      disabled={!!cart.discount_code}
                      style={{ width: 'calc(100% - 88px)' }}
                    />
                  )}
                />
                {cart.discount_code ? (
                  <Button danger onClick={handleRemoveDiscount}>
                    Remove
                  </Button>
                ) : (
                  <Button type="primary" htmlType="submit">
                    Apply
                  </Button>
                )}
              </Space.Compact>
              {discountErrors.discountCode && (
                <Text type="danger" className="mt-1 block">
                  {discountErrors.discountCode.message}
                </Text>
              )}
              {cart.discount_code && (
                <div className="mt-2">
                  <Tag color="green">
                    Applied: {cart.discount_code}
                  </Tag>
                </div>
              )}
            </form>
          </Card>

          <Card>
            <Typography.Title level={4}>Order Summary</Typography.Title>
            <Divider />

            <div className="flex justify-between mb-2">
              <Typography.Text>Subtotal</Typography.Text>
              <Typography.Text strong>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.subtotal)}
              </Typography.Text>
            </div>

            {cart.discount_amount > 0 && (
              <div className="flex justify-between mb-2">
                <Typography.Text>Discount</Typography.Text>
                <Typography.Text strong className="text-red-500">
                  -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.discount_amount)}
                </Typography.Text>
              </div>
            )}

            {cart.shipping_fee > 0 && (
              <div className="flex justify-between mb-2">
                <Typography.Text>Shipping</Typography.Text>
                <Typography.Text strong>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.shipping_fee)}
                </Typography.Text>
              </div>
            )}

            <Divider />

            <div className="flex justify-between mb-4">
              <Typography.Text strong>Total</Typography.Text>
              <Typography.Text strong className="text-blue-600 text-lg">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.total_amount)}
              </Typography.Text>
            </div>

            <Button 
              type="primary" 
              block 
              size="large" 
              onClick={handleCheckout}
              disabled={cart.items.length === 0}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartScreen;