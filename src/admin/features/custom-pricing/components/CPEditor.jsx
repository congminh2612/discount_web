import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Input, DatePicker, Button, Radio, Card, Form, Modal, Select, Tag } from 'antd';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { getMarket } from '@/service/market';
import { getProduct } from '@/service/product';
import { getCustomer } from '@/service/user';
import ProductListPreview from './ProductListPreview';
import SaveBar from '@/admin/components/savebar/Savebar';
import { normalizeValues } from '@/utils/form';
import { isEqual } from 'lodash';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomerModal from './CustomerModal';
import ProductModal from './ProductModal';
import { useTranslation } from 'react-i18next';

const CPEditor = ({ initialData = {} }) => {
  const { t } = useTranslation();
  const CPFormSchema = z.object({
    title: z.string().min(1, { message: 'Tên chương trình không được để trống' }),
    priority: z.number().min(0, { message: 'Priority phải lớn hơn hoặc bằng 0' }),
    discount_type: z.string(),
    discount_value: z.number().min(0, { message: 'Giá trị giảm giá phải lớn hơn hoặc bằng 0' }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    customer_type: z.string(),
    selected_customers: z.array(z.number().min(1, { message: 'Chọn ít nhất 1 khách hàng' })),
    market_type: z.string(),
    selected_markets: z.array(z.number().min(1, { message: 'Chọn ít nhất 1 thị trường' })),
    product_type: z.string(),
    selected_products: z.array(z.number().min(1, { message: 'Chọn ít nhất 1 sản phẩm' })),
  });
  const defaultValues = useMemo(
    () => ({
      title: initialData.title || '',
      priority: initialData.priority || 1,
      discount_type: initialData.discount_type || 'percentage',
      discount_value: initialData.discount_value || 0,
      start_date: initialData?.start_date ? dayjs(initialData.start_date) : dayjs(),
      end_date: initialData?.end_date ? dayjs(initialData.end_date) : dayjs(),
      customer_type: initialData.customer_type || 'all',
      selected_customers: initialData.selected_customers || [],
      market_type: initialData.market_type || 'all',
      selected_markets: initialData.selected_markets || [],
      product_type: initialData.productType || 'product',
      selected_products: initialData.selected_products || [],
    }),
    [initialData],
  );

  console.log('start_date type:', typeof new Date(2021, 9, 1));

  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [openPreviewProduct, setOpenPreviewProduct] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
    resolver: zodResolver(CPFormSchema),
  });

  const customer_type = useWatch({ control, name: 'customer_type' });
  const selected_customers = useWatch({ control, name: 'selected_customers' });
  const selected_products = useWatch({ control, name: 'selected_products' });
  const discount_type = useWatch({ control, name: 'discount_type' });
  const market_type = watch('market_type');

  const { data: markets } = useQuery({ queryKey: ['markets'], queryFn: getMarket });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => getProduct([]) });
  console.log('🚀 ~ CPEditor ~ products:', products);
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomer,
  });

  const allCustomerIds = useMemo(() => customers?.data?.map((c) => c.id) || [], [customers]);
  const allProductIds = useMemo(() => products?.data?.map((p) => p.id) || [], [products]);

  const onSubmit = (data) => console.log('Form Submitted:', data);

  const watchedValues = useWatch({ control });

  const isFormChanged = useMemo(() => !isEqual(watchedValues, defaultValues), [watchedValues, defaultValues]);

  console.log('🚀 ~ CPEditor ~ customer_type:', customer_type);
  useEffect(() => {
    switch (customer_type) {
      case 'all':
        setValue('selected_customers', allCustomerIds);
        break;
      case 'specific':
        setValue('selected_customers', []);
        break;
      default:
        setValue('selected_customers', []);
        break;
    }
  }, [customer_type, setValue, allCustomerIds, customers]);

  console.log('selectedCustomers', selected_customers);

  return (
    <div className='p-6 rounded-lg max-w-[1100px] mx-auto h-[80vh]'>
      <h2 className='text-2xl font-semibold mb-6'>{initialData.id ? 'Chỉnh sửa' : 'Tạo mới'} Custom Pricing</h2>
      <Form layout='vertical' onFinish={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-2 gap-6'>
          <label className='ml-4 font-medium text-base'>{t('cp.general_info')}</label>
          <Card className='w-full space-y-4 p-4 shadow-sm'>
            <Controller
              name='title'
              control={control}
              rules={{ required: 'Tên chương trình không được để trống' }}
              render={({ field }) => (
                <Form.Item
                  label='Tên giảm giá'
                  required
                  validateStatus={errors.title ? 'error' : ''}
                  help={errors.title?.message}
                >
                  <Input {...field} placeholder='Nhập tên chương trình' />
                </Form.Item>
              )}
            />
            <Controller
              name='priority'
              control={control}
              rules={{ min: { value: 1, message: 'Priority phải lớn hơn hoặc bằng 0' } }}
              render={({ field }) => (
                <Form.Item label={t('cp.priority')} required>
                  <Input {...field} type='number' min={0} />
                </Form.Item>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='start_date'
                control={control}
                render={({ field }) => (
                  <Form.Item label={t('general.start_date')} required>
                    <DatePicker
                      {...field}
                      className='w-full'
                      showTime
                      format='DD/MM/YYYY HH:mm'
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>
                )}
              />

              <Controller
                name='end_date'
                control={control}
                render={({ field }) => (
                  <Form.Item label={t('general.end_date')} required>
                    <DatePicker
                      {...field}
                      className='w-full'
                      showTime
                      format='DD/MM/YYYY HH:mm'
                      disabledDate={(current) => current && current < watch('start_date')}
                    />
                  </Form.Item>
                )}
              />
            </div>
          </Card>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <label className='ml-4 font-medium text-base'>{t('cp.discount_type')}</label>
          <Card className='w-full p-4 shadow-sm space-y-4'>
            <Controller
              name='discount_type'
              control={control}
              render={({ field }) => (
                <Radio.Group {...field} className='flex flex-col space-y-3'>
                  <Radio value='percentage'>{t('cp.percentage_discount')}</Radio>
                  <Radio value='fixed'>{t('cp.amount_discount')}</Radio>
                </Radio.Group>
              )}
            />

            <div className='pt-4'>
              <Controller
                name='discount_value'
                control={control}
                render={({ field }) => (
                  <Form.Item label='Giá trị' required>
                    <Input
                      {...field}
                      type='number'
                      min={0}
                      placeholder={`Nhập ${discount_type === 'percentage' ? 'phần trăm' : 'số tiền'}`}
                      addonAfter={discount_type === 'percentage' ? '%' : 'VND'}
                    />
                  </Form.Item>
                )}
              />
            </div>
          </Card>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <label className='ml-4 font-medium text-base'>Chọn thị trường</label>
          <Card className='w-full p-4 shadow-sm space-y-4'>
            <Controller
              name='market_type'
              control={control}
              render={({ field }) => (
                <Radio.Group {...field} className='flex flex-col space-y-3'>
                  <Radio value='all'>Tất cả thị trường</Radio>
                  <Radio value='specific'>Thị trường cụ thể</Radio>
                </Radio.Group>
              )}
            />

            <div className='pt-4'>
              {market_type === 'specific' && (
                <Form.Item
                  validateStatus={errors.selected_markets ? 'error' : ''}
                  help={errors.selected_markets?.message}
                >
                  <Controller
                    name='selected_markets'
                    control={control}
                    rules={{
                      validate: (value) => value?.length > 0 || 'Chọn ít nhất 1 thị trường',
                    }}
                    render={({ field }) => (
                      <Select
                        mode='multiple'
                        placeholder='Chọn thị trường'
                        options={markets?.data?.map((m) => ({
                          label: m.name,
                          value: m.id,
                        }))}
                        {...field}
                      />
                    )}
                  />
                </Form.Item>
              )}
            </div>
          </Card>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <label className='ml-4 font-medium text-base'>Áp dụng cho khách hàng</label>
          <Card className='w-full p-4 shadow-sm'>
            <Controller
              name='customer_type'
              control={control}
              render={({ field }) => (
                <>
                  <Radio.Group {...field} className='flex flex-col space-y-3'>
                    <Radio value='all'>Tất cả khách hàng</Radio>
                    <Radio value='specific'>Chọn khách hàng cụ thể</Radio>
                  </Radio.Group>

                  {field.value === 'specific' && (
                    <div className='mt-4'>
                      <Button type='dashed' onClick={() => setIsCustomerModalVisible(true)}>
                        + Chọn khách hàng
                      </Button>
                      <div className='mt-2'>
                        {selected_customers.map((id) => {
                          const customer = customers.data?.find((c) => c.id === id);
                          return customer ? (
                            <Tag
                              key={id}
                              className='m-1'
                              closable
                              onClose={() => {
                                setValue(
                                  'selected_customers',
                                  selected_customers.filter((cId) => cId !== id),
                                );
                              }}
                            >
                              {customer.name}
                            </Tag>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            />
          </Card>
        </div>
        <div className='grid grid-cols-2 gap-6'>
          <label className='ml-4 font-medium text-base'>Áp dụng cho sản phẩm</label>
          <Card className='w-full p-4 shadow-sm'>
            <Controller
              name='product_type'
              control={control}
              render={({ field }) => (
                <>
                  <Radio.Group {...field} className='flex flex-col space-y-3'>
                    <Radio value='product'>Tất cả sản phẩm</Radio>
                    <Radio value='specific'>Sản phẩm cụ thể</Radio>
                  </Radio.Group>
                  {field.value == 'specific' && (
                    <div className='mt-4'>
                      <Button type='dashed' onClick={() => setIsProductModalVisible(true)}>
                        + Chọn sản phẩm
                      </Button>
                      <div className='mt-2'>
                        {selected_products?.map((id) => {
                          const product = products.data?.find((p) => p.id === id);
                          return product ? (
                            <Tag
                              key={id}
                              className='m-1'
                              closable
                              onClose={() => {
                                setValue(
                                  'selected_products',
                                  selected_products.filter((pId) => pId !== id),
                                );
                              }}
                            >
                              {product.name}
                            </Tag>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            />
          </Card>
        </div>

        <CustomerModal
          control={control}
          customers={customers}
          isVisible={isCustomerModalVisible}
          onClose={() => setIsCustomerModalVisible(false)}
          selectedCustomers={selected_customers}
        />
        <ProductModal
          control={control}
          products={products}
          isVisible={isProductModalVisible}
          onClose={() => setIsProductModalVisible(false)}
          selectedProducts={selected_products}
        />

        <div className='flex justify-end gap-4 my-8'>
          <SaveBar
            onSave={handleSubmit(onSubmit)}
            title={'Thêm rule'}
            onDiscard={() => reset()}
            visible={isFormChanged}
          />
          <div className='text-center'>
            <Button type='primary' onClick={() => setOpenPreviewProduct(true)}>
              Xem trước
            </Button>

            <Modal
              title='Danh sách sản phẩm được áp dụng'
              open={openPreviewProduct}
              onCancel={() => setOpenPreviewProduct(false)}
              footer={null}
              width={800}
            >
              <ProductListPreview customers={selected_customers} />
            </Modal>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CPEditor;
