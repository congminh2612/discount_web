import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Checkbox,
  Divider,
  Row,
  Col,
  Card,
  Input,
  message,
  Empty,
  Spin,
  Image,
  Popconfirm,
  InputNumber,
} from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  MessageOutlined,
  ShoppingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchCart,
  updateCartItemQuantity,
  removeCartItem,
  emptyCart,
  applyDiscountCode,
} from '@/context/slice/cart';
import { formatVND } from '@/utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [couponCode, setCouponCode] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Redux state
  const { currentUser } = useSelector((state) => state.auth);
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    totalAmount,
    discountCode,
    status,
    error,
  } = useSelector((state) => state.cart);

  // Fetch cart on component mount
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchCart(currentUser.id));
    }
  }, [dispatch, currentUser]);

  // Update selected items when cart items change
  useEffect(() => {
    if (items && items.length > 0) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [items]);

  // Order note handling
  useEffect(() => {
    if (items && items.length > 0) {
      setOrderNote(orderNote || '');
    }
  }, [items]);

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    dispatch(updateCartItemQuantity({ 
      cartItemId: itemId, 
      quantity: newQuantity 
    }));
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem(itemId));
  };

  // Handle empty cart
  const handleEmptyCart = () => {
    dispatch(emptyCart());
  };

  // Handle item selection
  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Coupon application handler
  const handleApplyCoupon = () => {
    if (!couponCode) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setIsApplyingCoupon(true);
    dispatch(applyDiscountCode(couponCode))
      .unwrap()
      .then(() => {
        message.success('Áp dụng mã giảm giá thành công');
      })
      .catch((err) => {
        message.error(err || 'Không thể áp dụng mã giảm giá');
      })
      .finally(() => {
        setIsApplyingCoupon(false);
      });
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    navigate('/checkout');
  };

  // Loading state
  if (status === 'loading' && !items.length) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Spin size="large" tip="Đang tải giỏ hàng..." />
      </div>
    );
  }

  // Empty cart state
  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Giỏ hàng của bạn đang trống"
          >
            <Button 
              type="primary" 
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/products')}
            >
              Tiếp tục mua sắm
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Typography.Title level={3} className="mb-0 flex items-center">
          <ShoppingCartOutlined className="mr-2" />
          Giỏ hàng của bạn
        </Typography.Title>
        <Button 
          type="default" 
          icon={<ReloadOutlined />} 
          onClick={() => dispatch(fetchCart(currentUser?.id))}
        >
          Làm mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card>
            <div className="flex items-center mb-4">
              <Checkbox 
                onChange={handleSelectAll}
                checked={selectedItems.length === items.length && items.length > 0}
              >
                <Text strong>Chọn tất cả ({items.length} sản phẩm)</Text>
              </Checkbox>
              
              {items.length > 0 && (
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa tất cả sản phẩm?"
                  onConfirm={handleEmptyCart}
                  okText="Xóa tất cả"
                  cancelText="Hủy"
                >
                  <Button 
                    type="text" 
                    danger 
                    className="ml-auto"
                  >
                    Xóa tất cả
                  </Button>
                </Popconfirm>
              )}
            </div>

            <Divider className="my-2" />

            {items.map((item) => (
              <div key={item.id} className="flex items-center py-4 border-b">
                <Checkbox
                  className="mr-4"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                />

                <Image
                  src={item.image || 'https://via.placeholder.com/150'}
                  alt={item.name}
                  className="w-24 h-24 object-cover mr-4 rounded"
                  preview={false}
                />

                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <Typography.Text strong>{item.name}</Typography.Text>
                      {item.variant_id && (
                        <div className="text-sm text-gray-500">
                          {/* We can add variant details here when available */}
                          SKU: {item.variant_id}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <Button
                          icon={<MinusOutlined />}
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        />
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(value) => handleQuantityChange(item.id, value)}
                          className="mx-2 w-16"
                        />
                        <Button
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        />
                      </div>

                      <div className="mr-4 text-right">
                        <Typography.Text strong>
                          {formatVND(item.total_price)}
                        </Typography.Text>
                        {item.discount_amount > 0 && (
                          <div className="text-xs text-red-500">
                            Giảm {formatVND(item.discount_amount)}
                          </div>
                        )}
                      </div>

                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={() => handleRemoveItem(item.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          <Card className="mt-4">
            <div className="flex items-center mb-3">
              <MessageOutlined className="mr-2 text-blue-500" />
              <Typography.Title level={5} className="mb-0">
                Ghi chú đơn hàng
              </Typography.Title>
            </div>
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú của bạn (nếu có)"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="mb-4">
            <div className="flex items-center mb-3">
              <TagOutlined className="mr-2 text-blue-500" />
              <Typography.Title level={5} className="mb-0">
                Mã giảm giá
              </Typography.Title>
            </div>
            <div className="flex">
              <Input
                placeholder="Nhập mã giảm giá"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="mr-2"
                disabled={isApplyingCoupon}
              />
              <Button
                type="primary"
                onClick={handleApplyCoupon}
                loading={isApplyingCoupon}
              >
                Áp dụng
              </Button>
            </div>
            {discountCode && (
              <div className="mt-2 p-2 bg-green-50 text-green-600 rounded">
                Đã áp dụng mã: {discountCode}
              </div>
            )}
          </Card>

          <Card>
            <Typography.Title level={4}>Thông tin thanh toán</Typography.Title>
            <Divider />

            <div className="flex justify-between mb-2">
              <Typography.Text>Tạm tính</Typography.Text>
              <Typography.Text strong>{formatVND(subtotal)}</Typography.Text>
            </div>

            <div className="flex justify-between mb-2">
              <Typography.Text>Giảm giá</Typography.Text>
              <Typography.Text strong className="text-red-500">
                {discountAmount > 0 ? `-${formatVND(discountAmount)}` : formatVND(0)}
              </Typography.Text>
            </div>

            <Divider />

            <div className="flex justify-between mb-4">
              <Typography.Text strong>Tổng cộng</Typography.Text>
              <Typography.Text strong className="text-blue-600 text-lg">
                {formatVND(totalAmount)}
              </Typography.Text>
            </div>

            <Button
              type="primary"
              block
              size="large"
              onClick={handleProceedToCheckout}
              disabled={selectedItems.length === 0}
            >
              Tiến hành thanh toán
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartScreen;