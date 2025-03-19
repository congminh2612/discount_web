import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Spin,
  Image,
  message,
  Modal,
  Typography,
  Card,
  Tag,
  Tooltip,
  Badge,
  Drawer,
  Statistic,
  Row,
  Col,
  Divider,
  Grid,
  List,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BarcodeOutlined,
  TagsOutlined,
  MenuOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { deleteProduct, getProduct } from '../../../service/product';
import { formatVND } from '../../../utils/format';
import { useNavigate } from 'react-router-dom';
import { getCategory } from '../../../service/category';
import Loading from '../../../components/loading/Loading';
import { motion } from 'framer-motion';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ProductManager = () => {
  const screens = useBreakpoint();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return screens.xs ? 'list' : 'table';
  });
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  useEffect(() => {
    if (screens.xs && viewMode === 'table') {
      setViewMode('list');
    }
  }, [screens, viewMode]);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['category'],
    queryFn: getCategory,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['product'],
    queryFn: () => getProduct([]),
  });

  const isLoading = categoriesLoading || productsLoading;

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      message.success('Xóa sản phẩm thành công!');
      queryClient.invalidateQueries(['product']);
    },
    onError: () => {
      message.error('Lỗi khi xóa sản phẩm!');
    },
  });

  const showDeleteConfirm = (productId, e) => {
    if (e) e.stopPropagation();

    confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác!',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        deleteMutation.mutate(productId);
      },
    });
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.data?.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter ? product.category_id === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const getCategoryName = (categoryId) => {
    if (!categories?.data) return 'N/A';
    const category = categories.data.find((cat) => cat.id === categoryId);
    return category ? category.name : 'N/A';
  };

  const getStockStatusTag = (quantity) => {
    if (quantity > 20) return <Tag color='success'>Còn hàng</Tag>;
    if (quantity > 0) return <Tag color='warning'>Sắp hết</Tag>;
    return <Tag color='error'>Hết hàng</Tag>;
  };

  const expandedRowRender = (record) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className={`bg-gray-50 mb-4 ${screens.xs ? 'p-2' : ''}`}>
        <Title level={5} className='mb-3'>
          Chi tiết biến thể sản phẩm
        </Title>
        {screens.xs ? (
          <List
            dataSource={record.variants}
            renderItem={(variant) => (
              <List.Item>
                <Card className='w-full' size='small'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between'>
                      <Text strong>SKU:</Text>
                      <Text copyable>{variant.sku}</Text>
                    </div>
                    <div className='flex justify-between'>
                      <Text strong>Giá gốc:</Text>
                      <Text type='secondary'>{formatVND(variant.original_price)}</Text>
                    </div>
                    <div className='flex justify-between'>
                      <Text strong>Giá cuối:</Text>
                      <Text type='success'>{formatVND(variant.final_price)}</Text>
                    </div>
                    <div className='flex justify-between'>
                      <Text strong>Tồn kho:</Text>
                      {getStockStatusTag(variant.stock_quantity)}
                    </div>
                    <div>
                      <Text strong>Thuộc tính:</Text>
                      <div className='mt-1'>
                        <Space wrap size={[0, 4]}>
                          {variant.attributes.map((attr, index) => (
                            <Tag key={index} color='blue'>{`${attr.attribute_name}: ${attr.value}`}</Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Table
            columns={variantColumns}
            dataSource={record.variants}
            rowKey='id'
            pagination={false}
            size='small'
            className='border rounded-lg shadow-sm'
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </motion.div>
  );

  const showProductDetails = (product) => {
    setSelectedProduct(product);
    setDetailsVisible(true);
  };

  const variantColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku) => <Text copyable>{sku}</Text>,
    },
    {
      title: 'Giá gốc',
      dataIndex: 'original_price',
      key: 'original_price',
      render: (price) => <Text type='secondary'>{formatVND(price)}</Text>,
    },
    {
      title: 'Giá cuối',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (price) => <Text strong>{formatVND(price)}</Text>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      render: (quantity) => getStockStatusTag(quantity),
    },
    {
      title: 'Thuộc tính',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes) => (
        <Space wrap>
          {attributes.map((attr, index) => (
            <Tag key={index} color='blue'>{`${attr.attribute_name}: ${attr.value}`}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 100,
      render: (image) => (
        <Image
          width={80}
          height={80}
          src={image || 'https://via.placeholder.com/80'}
          alt='Product Image'
          className='object-cover rounded-lg shadow-sm'
          preview={{
            mask: <EyeOutlined />,
          }}
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <Text
            strong
            className='text-lg hover:text-blue-500 cursor-pointer'
            onClick={() => showProductDetails(record)}
          >
            {name}
          </Text>
          <div className='mt-1'>
            <Tag color='cyan' icon={<TagsOutlined />}>
              {getCategoryName(record.category_id)}
            </Tag>
            {record.has_variant && <Tag color='purple'>Có biến thể</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      responsive: ['md'],
      render: (description) => (
        <Tooltip placement='topLeft' title={description}>
          <Text ellipsis={true} className='max-w-xs'>
            {description}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_, record) => (
        <div>
          {record.has_variant ? (
            <Tag icon={<DollarOutlined />} color='processing'>
              Nhiều giá
            </Tag>
          ) : (
            <div>
              <Text delete type='secondary' className='block'>
                {formatVND(record.original_price)}
              </Text>
              <Text strong className='block text-red-500'>
                {formatVND(record.final_price)}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      responsive: ['lg'],
      render: (_, record) => (
        <div>
          {record.has_variant ? (
            <Badge count={record.variants?.length || 0} showZero overflowCount={99}>
              <Text type='secondary'>Biến thể</Text>
            </Badge>
          ) : (
            getStockStatusTag(record.stock_quantity)
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: screens.sm ? 200 : 100,
      render: (_, record) => (
        <Space size={screens.sm ? 'middle' : 'small'}>
          {screens.sm && (
            <Tooltip title='Xem chi tiết'>
              <Button
                onClick={() => showProductDetails(record)}
                icon={<EyeOutlined />}
                shape='circle'
                size={screens.xs ? 'small' : 'middle'}
              />
            </Tooltip>
          )}
          <Tooltip title='Chỉnh sửa'>
            <Button
              onClick={() => navigate(`edit/${record.id}`)}
              icon={<EditOutlined />}
              type='primary'
              shape='circle'
              size={screens.xs ? 'small' : 'middle'}
            />
          </Tooltip>
          <Tooltip title='Xóa'>
            <Button
              icon={<DeleteOutlined />}
              danger
              shape='circle'
              size={screens.xs ? 'small' : 'middle'}
              loading={deleteMutation.isLoading && deleteMutation.variables === record.id}
              onClick={(e) => showDeleteConfirm(record.id, e)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
  };

  const headerStatistics = [
    { title: 'Tổng sản phẩm', value: products?.data?.length || 0, icon: <ShoppingOutlined /> },
    {
      title: 'Sản phẩm biến thể',
      value: products?.data?.filter((p) => p.has_variant).length || 0,
      icon: <TagsOutlined />,
    },
    { title: 'Danh mục', value: categories?.data?.length || 0, icon: <TagsOutlined /> },
  ];

  const renderDrawerContent = () => {
    if (!selectedProduct) return null;

    return (
      <div>
        <div className='text-center mb-6'>
          <Image
            src={selectedProduct.image_url || 'https://via.placeholder.com/300'}
            alt={selectedProduct.name}
            width={screens.xs ? 150 : 200}
            className='rounded-lg shadow-md mb-4'
          />
          <Title level={4}>{selectedProduct.name}</Title>
          <Tag color='cyan'>{getCategoryName(selectedProduct.category_id)}</Tag>
        </div>

        <Divider />

        <div className='mb-6'>
          <Title level={5}>Thông tin sản phẩm</Title>
          <Text>{selectedProduct.description}</Text>
        </div>

        {!selectedProduct.has_variant ? (
          <div className='mb-6'>
            <Row gutter={16}>
              <Col span={screens.xs ? 24 : 12} className={screens.xs ? 'mb-4' : ''}>
                <Statistic
                  title='Giá gốc'
                  value={selectedProduct.original_price}
                  formatter={(value) => formatVND(value)}
                />
              </Col>
              <Col span={screens.xs ? 24 : 12}>
                <Statistic
                  title='Giá bán'
                  value={selectedProduct.final_price}
                  formatter={(value) => formatVND(value)}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
            <Divider />
            <Statistic
              title='Tồn kho'
              value={selectedProduct.stock_quantity}
              prefix={<BarcodeOutlined />}
              valueStyle={{ color: selectedProduct.stock_quantity > 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </div>
        ) : (
          <div>
            <Title level={5}>Biến thể sản phẩm</Title>
            {screens.xs ? (
              <List
                dataSource={selectedProduct.variants}
                renderItem={(variant) => (
                  <List.Item>
                    <Card className='w-full' size='small'>
                      <div className='flex flex-col gap-2'>
                        <div className='flex justify-between'>
                          <Text strong>SKU:</Text>
                          <Text copyable>{variant.sku}</Text>
                        </div>
                        <div className='flex justify-between'>
                          <Text strong>Giá gốc:</Text>
                          <Text type='secondary'>{formatVND(variant.original_price)}</Text>
                        </div>
                        <div className='flex justify-between'>
                          <Text strong>Giá cuối:</Text>
                          <Text type='success'>{formatVND(variant.final_price)}</Text>
                        </div>
                        <div className='flex justify-between'>
                          <Text strong>Tồn kho:</Text>
                          {getStockStatusTag(variant.stock_quantity)}
                        </div>
                        <div>
                          <Text strong>Thuộc tính:</Text>
                          <div className='mt-1'>
                            <Space wrap size={[0, 4]}>
                              {variant.attributes.map((attr, index) => (
                                <Tag key={index} color='blue'>{`${attr.attribute_name}: ${attr.value}`}</Tag>
                              ))}
                            </Space>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Table
                columns={variantColumns}
                dataSource={selectedProduct.variants}
                rowKey='id'
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFilterDrawer = () => (
    <Drawer
      title='Bộ lọc'
      placement='right'
      onClose={() => setFilterDrawerVisible(false)}
      open={filterDrawerVisible}
      width={screens.xs ? 300 : 400}
    >
      <div className='flex flex-col gap-4'>
        <div>
          <Text strong>Tìm kiếm</Text>
          <Search
            placeholder='Tìm kiếm sản phẩm'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className='w-full mt-2'
          />
        </div>

        <div>
          <Text strong>Danh mục</Text>
          <Select
            placeholder='Chọn danh mục'
            value={categoryFilter}
            allowClear
            onChange={(value) => setCategoryFilter(value)}
            className='w-full mt-2'
            loading={categoriesLoading}
          >
            {categories?.data?.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              resetFilters();
              setFilterDrawerVisible(false);
            }}
            block
          >
            Reset bộ lọc
          </Button>
        </div>
      </div>
    </Drawer>
  );

  const renderMobileList = () => (
    <List
      loading={isLoading}
      itemLayout='horizontal'
      dataSource={filteredProducts}
      renderItem={(item) => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <List.Item className='mb-4 border rounded-lg shadow-sm p-3 bg-white' onClick={() => showProductDetails(item)}>
            <div className='flex w-full'>
              <div className='mr-4'>
                <Avatar
                  src={item.image_url || 'https://via.placeholder.com/60'}
                  size={64}
                  shape='square'
                  className='rounded-md'
                />
              </div>
              <div className='flex-1'>
                <div className='flex justify-between mb-1'>
                  <div>
                    <Text strong className='text-lg'>
                      {item.name}
                    </Text>
                  </div>
                  <div>
                    <Space>
                      <Button
                        type='primary'
                        size='small'
                        icon={<EditOutlined />}
                        shape='circle'
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`edit/${item.id}`);
                        }}
                      />
                      <Button
                        danger
                        size='small'
                        icon={<DeleteOutlined />}
                        shape='circle'
                        onClick={(e) => showDeleteConfirm(item.id, e)}
                      />
                    </Space>
                  </div>
                </div>

                <div className='flex flex-wrap gap-1 mb-2'>
                  <Tag color='cyan'>{getCategoryName(item.category_id)}</Tag>
                  {item.has_variant && <Tag color='purple'>Có biến thể</Tag>}
                </div>

                <div className='flex justify-between'>
                  <div>
                    {!item.has_variant ? (
                      <div>
                        <Text delete type='secondary' className='block text-xs'>
                          {formatVND(item.original_price)}
                        </Text>
                        <Text strong className='block text-red-500'>
                          {formatVND(item.final_price)}
                        </Text>
                      </div>
                    ) : (
                      <Tag color='processing'>Nhiều giá</Tag>
                    )}
                  </div>
                  <div>
                    {!item.has_variant ? (
                      getStockStatusTag(item.stock_quantity)
                    ) : (
                      <Badge count={item.variants?.length || 0} showZero overflowCount={99}>
                        <Text type='secondary'>Biến thể</Text>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </List.Item>
        </motion.div>
      )}
      pagination={{
        pageSize: 10,
        size: 'small',
        showSizeChanger: false,
        showTotal: (total) => `Tổng ${total} sản phẩm`,
      }}
      locale={{
        emptyText: (
          <div className='text-center py-8'>
            <Title level={5} type='secondary'>
              Không tìm thấy sản phẩm
            </Title>
            <Text type='secondary'>Hãy thử thay đổi bộ lọc hoặc thêm sản phẩm mới</Text>
          </div>
        ),
      }}
    />
  );

  return (
    <div className='bg-white rounded-xl h-[80vh] overflow-y-auto shadow-lg'>
      <div className='p md:p-6 border-b'>
        <Row gutter={[16, 16]} className='mb-4'>
          {headerStatistics.map((stat, index) => (
            <Col xs={24} sm={8} key={index}>
              <Card bordered={false} className='shadow-sm'>
                <Statistic title={stat.title} value={stat.value} prefix={stat.icon} />
              </Card>
            </Col>
          ))}
        </Row>

        <div className='flex justify-between items-center mb-4'>
          <Title level={4} className='mb-0'>
            Quản lý sản phẩm
          </Title>
          {screens.md && (
            <Space>
              <Button
                icon={viewMode === 'table' ? <AppstoreOutlined /> : <MenuOutlined />}
                onClick={() => setViewMode(viewMode === 'table' ? 'list' : 'table')}
              >
                {viewMode === 'table' ? 'Xem dạng lưới' : 'Xem dạng bảng'}
              </Button>
            </Space>
          )}
        </div>

        <div className='flex flex-wrap gap-2 justify-between items-center'>
          {screens.md ? (
            <div className='flex flex-wrap gap-2 items-center'>
              <Search
                placeholder='Tìm kiếm sản phẩm'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                prefix={<SearchOutlined />}
                style={{ width: screens.lg ? 250 : 200 }}
              />
              <Select
                placeholder='Chọn danh mục'
                value={categoryFilter}
                allowClear
                onChange={(value) => setCategoryFilter(value)}
                style={{ width: screens.lg ? 200 : 150 }}
                loading={categoriesLoading}
              >
                {categories?.data?.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
              {(searchTerm || categoryFilter) && (
                <Button icon={<ReloadOutlined />} onClick={resetFilters} size='middle'>
                  Reset
                </Button>
              )}
            </div>
          ) : (
            <Button icon={<FilterOutlined />} onClick={() => setFilterDrawerVisible(true)}>
              Bộ lọc {(searchTerm || categoryFilter) && <Badge count='!' />}
            </Button>
          )}

          <div className='space-x-2'>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => navigate('create')}
              className='bg-green-600 hover:bg-green-700'
            >
              {screens.sm ? 'Thêm sản phẩm' : 'Thêm'}
            </Button>
            {screens.sm && <Button icon={<UploadOutlined />}>Import</Button>}
          </div>
        </div>
      </div>

      <div className='p-4 md:p-6'>
        {isLoading ? (
          <div className='flex justify-center py-12'>
            <Spin size='large' tip='Đang tải dữ liệu...' />
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <>
            {screens.xs || viewMode === 'list' ? (
              renderMobileList()
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Table
                  dataSource={filteredProducts}
                  columns={columns}
                  rowKey='id'
                  expandable={{
                    expandedRowRender,
                    expandRowByClick: false,
                    expandIcon: ({ expanded, onExpand, record }) =>
                      record.has_variant ? (
                        expanded ? (
                          <Button
                            type='text'
                            icon={<UploadOutlined rotate={180} />}
                            onClick={(e) => onExpand(record, e)}
                          />
                        ) : (
                          <Button type='text' icon={<UploadOutlined />} onClick={(e) => onExpand(record, e)} />
                        )
                      ) : null,
                  }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: screens.lg,
                    showQuickJumper: screens.lg,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                    size: screens.sm ? 'default' : 'small',
                  }}
                  bordered={false}
                  className='custom-table'
                  loading={isLoading}
                  rowClassName='hover:bg-gray-50 transition-colors'
                  scroll={{ x: 'max-content' }}
                />
              </motion.div>
            )}
          </>
        ) : (
          <div className='text-center py-12 bg-gray-50 rounded-lg'>
            <Title level={4} type='secondary'>
              Không tìm thấy sản phẩm
            </Title>
            <Text type='secondary'>Hãy thử thay đổi bộ lọc hoặc thêm sản phẩm mới</Text>
            <div className='mt-4'>
              <Button type='primary' icon={<PlusOutlined />} onClick={() => navigate('create')}>
                Thêm sản phẩm
              </Button>
            </div>
          </div>
        )}
      </div>

      <Drawer
        title='Chi tiết sản phẩm'
        width={screens.xs ? '100%' : 520}
        placement={screens.xs ? 'bottom' : 'right'}
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        height={screens.xs ? '85vh' : undefined}
        extra={
          selectedProduct && (
            <Space>
              <Button onClick={() => navigate(`edit/${selectedProduct.id}`)} icon={<EditOutlined />} type='primary'>
                Chỉnh sửa
              </Button>
            </Space>
          )
        }
      >
        {renderDrawerContent()}
      </Drawer>

      {renderFilterDrawer()}
    </div>
  );
};

export default ProductManager;
