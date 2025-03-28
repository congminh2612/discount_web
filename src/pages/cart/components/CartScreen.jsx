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
  Spin,
  Empty,
  Badge,
  Tooltip,
  Image,
  Tag,
  Progress,
} from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  MessageOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  LockOutlined,
  GiftOutlined,
  TruckOutlined,
  HeartOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cartService } from '@/service/cart';
import { useSelector } from 'react-redux';

const CartScreen = () => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userId = currentUser?.id;

  // Animation effect for free shipping progress
  const [progressPercent, setProgressPercent] = useState(0);

  // Lấy dữ liệu giỏ hàng từ API
  const {
    data: cartResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => cartService.getCart(userId),
    enabled: !!userId,
  });

  // Các hàm xử lý tạm thời chỉ log ra console
  const handleQuantityChange = (itemId, change) => {
    console.log(`Thay đổi số lượng, itemId: ${itemId}, change: ${change}`);
  };

  const handleRemoveItem = (itemId) => {
    console.log(`Xóa sản phẩm, itemId: ${itemId}`);
    message.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleApplyCoupon = () => {
    if (!couponCode) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }
    console.log(`Áp dụng mã giảm giá: ${couponCode}`);
    message.success('Áp dụng mã giảm giá thành công');
  };

  const handleUpdateNote = () => {
    console.log(`Cập nhật ghi chú: ${orderNote}`);
    message.success('Đã lưu ghi chú đơn hàng');
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems((cartResponse?.data?.items || []).map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Calculate progress percent for free shipping
  useEffect(() => {
    if (cartResponse?.data) {
      const subtotal = parseFloat(cartResponse.data.subtotal) || 0;
      const freeShippingThreshold = 500000; // Ngưỡng miễn phí vận chuyển (500,000đ)
      const percent = Math.min(Math.round((subtotal / freeShippingThreshold) * 100), 100);

      // Animate the progress
      let startPercent = 0;
      const interval = setInterval(() => {
        startPercent += 2;
        setProgressPercent(Math.min(startPercent, percent));
        if (startPercent >= percent) {
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [cartResponse]);

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className='bg-white min-h-screen flex flex-col items-center justify-center'>
        <div className='text-center p-8 max-w-md'>
          <ShoppingCartOutlined className='text-blue-500 text-6xl mb-4' />
          <Spin size='large' className='my-4' />
          <Typography.Title level={4} className='mt-4 font-normal text-gray-600'>
            Đang tải giỏ hàng của bạn...
          </Typography.Title>
          <Typography.Text className='text-gray-500'>
            Chúng tôi đang chuẩn bị giỏ hàng, vui lòng đợi trong giây lát
          </Typography.Text>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (isError) {
    return (
      <div className='bg-white min-h-screen flex flex-col items-center justify-center'>
        <div className='text-center p-8 max-w-md'>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Typography.Title level={4} className='mt-4 font-normal text-gray-600'>
                  Không thể tải giỏ hàng
                </Typography.Title>
                <Typography.Text className='text-gray-500 block mb-4'>
                  Đã xảy ra lỗi khi tải giỏ hàng. Vui lòng thử lại sau.
                </Typography.Text>
              </div>
            }
          />
          <Button type='primary' size='large' className='mt-4 px-8 h-12' onClick={() => navigate('/products')}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  // Lấy dữ liệu từ response API
  const cart = cartResponse?.data || {};
  const items = cart.items || [];
  const subtotal = parseFloat(cart.subtotal) || 0;
  const discount_amount = parseFloat(cart.discount_amount) || 0;
  const total_amount = parseFloat(cart.total_amount) || 0;

  // Hiển thị giỏ hàng trống
  if (!items || items.length === 0) {
    return (
      <div className='bg-white min-h-screen'>
        <div className='container mx-auto px-4 py-12 max-w-4xl'>
          <div className='flex items-center mb-8'>
            <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')} className='mr-2'>
              Tiếp tục mua sắm
            </Button>
            <Typography.Title level={3} className='m-0'>
              Giỏ hàng
            </Typography.Title>
          </div>

          <div className='bg-gray-50 rounded-2xl shadow-sm p-12 text-center'>
            <div className='flex flex-col items-center'>
              <div className='mb-6 rounded-full bg-blue-50 p-6'>
                <ShoppingCartOutlined style={{ fontSize: 80, color: '#3b82f6' }} />
              </div>
              <Typography.Title level={3} className='mt-2 font-medium'>
                Giỏ hàng của bạn đang trống
              </Typography.Title>
              <Typography.Paragraph className='text-gray-500 mb-8 max-w-md'>
                Có vẻ như bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng. Hãy tiếp tục mua sắm để tìm sản phẩm bạn yêu
                thích.
              </Typography.Paragraph>
              <Button
                type='primary'
                size='large'
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/products')}
                className='h-12 px-8 text-base'
              >
                Khám phá sản phẩm ngay
              </Button>

              <div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
                <div className='flex flex-col items-center'>
                  <div className='mb-3 rounded-full bg-orange-50 p-3'>
                    <TagOutlined style={{ fontSize: 24, color: '#f97316' }} />
                  </div>
                  <Typography.Text strong>Ưu đãi độc quyền</Typography.Text>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='mb-3 rounded-full bg-green-50 p-3'>
                    <TruckOutlined style={{ fontSize: 24, color: '#22c55e' }} />
                  </div>
                  <Typography.Text strong>Giao hàng nhanh</Typography.Text>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='mb-3 rounded-full bg-blue-50 p-3'>
                    <SafetyOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
                  </div>
                  <Typography.Text strong>Đảm bảo chất lượng</Typography.Text>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='mb-3 rounded-full bg-purple-50 p-3'>
                    <HeartOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />
                  </div>
                  <Typography.Text strong>Dịch vụ khách hàng</Typography.Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format số tiền VND
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('vi-VN') + 'đ';
  };

  // Calculate free shipping info
  const freeShippingThreshold = 500000; // 500,000đ
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const isFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <div className='bg-gray-50 min-h-screen py-8'>
      <div className='container mx-auto px-4 max-w-6xl'>
        <div className='flex items-center mb-8'>
          <Button
            type='link'
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
            className='mr-2 flex items-center text-gray-600 hover:text-blue-500'
          >
            Tiếp tục mua sắm
          </Button>
          <Typography.Title level={3} className='m-0 flex items-center'>
            <ShoppingCartOutlined className='mr-2' />
            Giỏ hàng của bạn
            <Badge count={items.length} className='ml-3' style={{ backgroundColor: '#3b82f6' }} />
          </Typography.Title>
        </div>

        {/* Free Shipping Progress */}
        {!isFreeShipping && (
          <Card className='mb-6 rounded-xl border-0 shadow-sm overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-500 to-indigo-600 -mx-6 -mt-6 py-4 px-6 text-white'>
              <div className='flex items-center'>
                <TruckOutlined className='text-2xl mr-3' />
                <Typography.Title level={5} className='m-0 text-white'>
                  Miễn phí vận chuyển cho đơn hàng từ {formatPrice(freeShippingThreshold)}
                </Typography.Title>
              </div>
            </div>
            <div className='mt-4'>
              <div className='flex justify-between mb-2'>
                <Typography.Text>
                  Thêm {formatPrice(amountToFreeShipping)} nữa để được miễn phí vận chuyển
                </Typography.Text>
                <Typography.Text strong>{progressPercent}%</Typography.Text>
              </div>
              <Progress
                percent={progressPercent}
                showInfo={false}
                strokeColor={{
                  '0%': '#3b82f6',
                  '100%': '#4f46e5',
                }}
                trailColor='#e5e7eb'
                strokeWidth={8}
                className='custom-progress'
              />
            </div>
          </Card>
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className='rounded-xl border-0 shadow-sm'>
              <div className='flex justify-between items-center mb-6'>
                <Typography.Title level={5} className='m-0 flex items-center'>
                  <Checkbox
                    className='mr-3'
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                  Tất cả sản phẩm ({items.length})
                </Typography.Title>

                <Button type='text' danger icon={<DeleteOutlined />} disabled={selectedItems.length === 0}>
                  Xóa đã chọn ({selectedItems.length})
                </Button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className='mb-6 last:mb-0 bg-white rounded-xl hover:shadow-md transition-shadow duration-300'
                >
                  <div className='flex flex-col sm:flex-row p-4 sm:items-center'>
                    <div className='flex items-start sm:items-center mr-4 mb-4 sm:mb-0'>
                      <Checkbox
                        className='mr-3 mt-1 sm:mt-0'
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                      <div className='relative'>
                        <Image
                          src={item.image || 'https://via.placeholder.com/150'}
                          alt={item.name}
                          className='rounded-lg'
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover' }}
                          preview={false}
                        />
                        {parseFloat(item.discount_amount) > 0 && (
                          <Badge.Ribbon
                            text={`-${Math.round((item.discount_amount / (item.unit_price * item.quantity)) * 100)}%`}
                            color='#f43f5e'
                            className='absolute top-0 right-0'
                          />
                        )}
                      </div>
                    </div>

                    <div className='flex-grow'>
                      <div className='flex flex-col sm:flex-row justify-between'>
                        <div className='mb-3 sm:mb-0 pr-4'>
                          <Typography.Text
                            strong
                            className='text-lg hover:text-blue-500 cursor-pointer block'
                            onClick={() => navigate(`/products/${item.product_id}`)}
                          >
                            {item.name}
                          </Typography.Text>

                          <div className='flex flex-wrap gap-2 mt-2'>
                            {item.sku && (
                              <Tag color='default' className='mr-0'>
                                SKU: {item.sku}
                              </Tag>
                            )}

                            {item.stock_quantity > 0 ? (
                              <Tag color='success' icon={<ClockCircleOutlined />} className='mr-0'>
                                Còn hàng
                              </Tag>
                            ) : (
                              <Tag color='error' className='mr-0'>
                                Hết hàng
                              </Tag>
                            )}
                          </div>

                          {parseFloat(item.discount_amount) > 0 && (
                            <div className='mt-2'>
                              <Tag color='red' icon={<TagOutlined />}>
                                Giảm {formatPrice(item.discount_amount)}
                              </Tag>
                            </div>
                          )}
                        </div>

                        <div className='flex flex-col items-start sm:items-end'>
                          <div className='flex items-baseline'>
                            <Typography.Text strong className='text-lg text-blue-600'>
                              {formatPrice(item.total_price)}
                            </Typography.Text>

                            {parseFloat(item.discount_amount) > 0 && (
                              <Typography.Text delete className='text-gray-400 text-sm ml-2'>
                                {formatPrice(item.unit_price * item.quantity)}
                              </Typography.Text>
                            )}
                          </div>

                          <div className='flex items-center mt-3 border rounded-full bg-gray-50 overflow-hidden'>
                            <Button
                              type='text'
                              icon={<MinusOutlined />}
                              className='border-0 bg-transparent hover:bg-gray-100'
                              onClick={() => handleQuantityChange(item.id, -1)}
                            />
                            <div className='px-3 font-medium'>{item.quantity}</div>
                            <Button
                              type='text'
                              icon={<PlusOutlined />}
                              className='border-0 bg-transparent hover:bg-gray-100'
                              onClick={() => handleQuantityChange(item.id, 1)}
                            />
                          </div>

                          <div className='mt-3 flex'>
                            <Button
                              type='text'
                              icon={<HeartOutlined />}
                              className='text-gray-500 hover:text-pink-500 hover:bg-pink-50 mr-1'
                            >
                              Lưu
                            </Button>
                            <Button
                              type='text'
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveItem(item.id)}
                              className='hover:bg-red-50'
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <Card className='mt-6 rounded-xl border-0 shadow-sm'>
              <div className='flex items-center mb-4'>
                <MessageOutlined className='text-xl text-blue-500 mr-3' />
                <Typography.Title level={5} className='m-0'>
                  Ghi chú đơn hàng
                </Typography.Title>
                <Tooltip title='Thông tin thêm về đơn hàng hoặc yêu cầu đặc biệt khi giao hàng'>
                  <InfoCircleOutlined className='ml-2 text-gray-400' />
                </Tooltip>
              </div>
              <TextArea
                rows={4}
                placeholder='Nhập ghi chú của bạn (nếu có). Ví dụ: Thời gian nhận hàng, địa điểm cụ thể...'
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                onBlur={handleUpdateNote}
                className='rounded-lg'
                maxLength={500}
              />
              <div className='mt-2 text-right text-gray-500 text-sm'>{orderNote.length}/500 ký tự</div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div className='sticky top-6'>
              <Card className='mb-6 rounded-xl border-0 shadow-sm overflow-hidden'>
                <div className='bg-gradient-to-r from-orange-500 to-amber-500 -mx-6 -mt-6 py-4 px-6 text-white flex items-center mb-4'>
                  <GiftOutlined className='text-2xl mr-3' />
                  <Typography.Title level={5} className='m-0 text-white'>
                    Mã giảm giá
                  </Typography.Title>
                </div>

                {cart.discount_code ? (
                  <div className='bg-orange-50 p-4 rounded-lg border border-orange-100'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <Tag color='success' className='mr-2 text-base px-2 py-1'>
                          {cart.discount_code}
                        </Tag>
                        <Typography.Text type='success'>Đã áp dụng</Typography.Text>
                      </div>
                      <Button danger type='link' size='small' onClick={() => console.log('Hủy mã giảm giá')}>
                        Hủy
                      </Button>
                    </div>
                    <div className='text-red-500 font-medium mt-2'>Giảm: {formatPrice(discount_amount)}</div>
                  </div>
                ) : (
                  <div>
                    <div className='flex'>
                      <Input
                        placeholder='Nhập mã giảm giá'
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        prefix={<TagOutlined className='text-gray-400' />}
                        className='rounded-l-lg'
                      />
                      <Button type='primary' onClick={handleApplyCoupon} className='rounded-r-lg'>
                        Áp dụng
                      </Button>
                    </div>
                    <div className='mt-3 flex flex-wrap gap-2'>
                      <Tag
                        color='orange'
                        className='cursor-pointer hover:opacity-80'
                        onClick={() => setCouponCode('SUMMER2025')}
                      >
                        SUMMER2025
                      </Tag>
                      <Tag
                        color='blue'
                        className='cursor-pointer hover:opacity-80'
                        onClick={() => setCouponCode('WELCOME10')}
                      >
                        WELCOME10
                      </Tag>
                      <Tag
                        color='green'
                        className='cursor-pointer hover:opacity-80'
                        onClick={() => setCouponCode('FREESHIP')}
                      >
                        FREESHIP
                      </Tag>
                    </div>
                    <Typography.Text type='secondary' className='text-xs mt-2 block'>
                      Nhấp vào mã để áp dụng hoặc nhập mã khác
                    </Typography.Text>
                  </div>
                )}
              </Card>

              <Card className='rounded-xl border-0 shadow-sm'>
                <Typography.Title level={4} className='mb-6'>
                  Thông tin thanh toán
                </Typography.Title>

                <div className='space-y-4 mb-6'>
                  <div className='flex justify-between'>
                    <Typography.Text className='text-gray-500'>Tạm tính ({items.length} sản phẩm)</Typography.Text>
                    <Typography.Text>{formatPrice(subtotal)}</Typography.Text>
                  </div>

                  {discount_amount > 0 && (
                    <div className='flex justify-between'>
                      <Typography.Text className='text-gray-500'>Giảm giá</Typography.Text>
                      <Typography.Text className='text-red-500 font-medium'>
                        -{formatPrice(discount_amount)}
                      </Typography.Text>
                    </div>
                  )}

                  <div className='flex justify-between'>
                    <Typography.Text className='text-gray-500'>Phí vận chuyển</Typography.Text>
                    <Typography.Text className={isFreeShipping ? 'text-green-500 font-medium' : ''}>
                      {isFreeShipping ? 'Miễn phí' : 'Tính khi thanh toán'}
                    </Typography.Text>
                  </div>
                </div>

                <Divider className='my-4' />

                <div className='flex justify-between mb-6'>
                  <Typography.Text strong className='text-lg'>
                    Tổng cộng
                  </Typography.Text>
                  <div className='text-right'>
                    <Typography.Text strong className='text-blue-600 text-2xl'>
                      {formatPrice(total_amount)}
                    </Typography.Text>
                    <div className='text-gray-500 text-xs'>(Đã bao gồm VAT nếu có)</div>
                  </div>
                </div>

                <Button
                  type='primary'
                  block
                  size='large'
                  onClick={() => navigate('/checkout')}
                  className='h-14 text-base flex items-center justify-center'
                  disabled={items.length === 0}
                >
                  <LockOutlined className='mr-2' />
                  Tiến hành thanh toán ({items.length})
                </Button>

                <div className='mt-6 space-y-3'>
                  <div className='flex items-center text-gray-600'>
                    <SafetyOutlined className='text-green-500 mr-2' />
                    <Typography.Text className='text-sm'>Thanh toán an toàn & bảo mật</Typography.Text>
                  </div>

                  <div className='flex items-center text-gray-600'>
                    <TruckOutlined className='text-blue-500 mr-2' />
                    <Typography.Text className='text-sm'>Giao hàng nhanh toàn quốc</Typography.Text>
                  </div>

                  <div className='flex items-center text-gray-600'>
                    <ClockCircleOutlined className='text-orange-500 mr-2' />
                    <Typography.Text className='text-sm'>Đổi trả miễn phí trong 7 ngày</Typography.Text>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CartScreen;
