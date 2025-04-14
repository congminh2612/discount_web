// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Modal,
//   Form,
//   Input,
//   DatePicker,
//   Button,
//   Radio,
//   message,
//   Spin,
// } from 'antd';
// import dayjs from 'dayjs';
// import { useForm } from 'antd/es/form/Form';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { createRule, updateRule } from '@/service/cp';
// import { getProduct } from '@/service/product';
// import ProductPriceTable from './ProductPriceTable';

// const PriceListModal = ({ open, onClose, editingData }) => {
//   const [form] = useForm();
//   const queryClient = useQueryClient();

//   const isEdit = !!editingData;
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [prices, setPrices] = useState({});

//   const { data: productsData, isLoading: isLoadingProducts } = useQuery({
//     queryKey: ['products'],
//     queryFn: getProduct,
//   });

//   const createMutation = useMutation({
//     mutationFn: createRule,
//     onSuccess: () => {
//       message.success('Tạo Price List thành công!');
//       queryClient.invalidateQueries(['custom-pricing-rules']);
//       onClose();
//     },
//     onError: () => message.error('Tạo thất bại'),
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }) => updateRule(id, data),
//     onSuccess: () => {
//       message.success('Cập nhật Price List thành công!');
//       queryClient.invalidateQueries(['custom-pricing-rules']);
//       onClose();
//     },
//     onError: () => message.error('Cập nhật thất bại'),
//   });

//   const defaultValues = useMemo(() => {
//     if (!editingData) {
//       return {
//         title: '',
//         description: '',
//         start_date: dayjs(),
//         end_date: null,
//       };
//     }

//     const rule = editingData;
//     const priceMap = {};
//     const selectedKeys = [];

//     (rule.custom_prices || []).forEach((item) => {
//       const key = `${item.level}-${item.id}`;
//       selectedKeys.push(key);
//       priceMap[key] = item.amount;
//     });

//     setSelectedRows(selectedKeys);
//     setPrices(priceMap);

//     return {
//       title: rule.title,
//       description: rule.description,
//       start_date: rule.start_date ? dayjs(rule.start_date) : null,
//       end_date: rule.end_date ? dayjs(rule.end_date) : null,
//     };
//   }, [editingData]);

//   useEffect(() => {
//     if (open) {
//       form.setFieldsValue(defaultValues);
//     } else {
//       form.resetFields();
//       setSelectedRows([]);
//       setPrices({});
//     }
//   }, [open, defaultValues, form]);

//   const onFinish = async (values) => {
//     const mappedPrices = selectedRows.map((key) => {
//       const [level, id] = key.split('-');
//       return {
//         level,
//         id: Number(id),
//         amount: prices[key] ?? 0,
//       };
//     });

//     const payload = {
//       ...values,
//       start_date: values.start_date?.toISOString(),
//       end_date: values.end_date?.toISOString() ?? null,
//       custom_prices: mappedPrices,
//     };

//     if (isEdit) {
//       await updateMutation.mutateAsync({ id: editingData.id, data: payload });
//     } else {
//       await createMutation.mutateAsync(payload);
//     }
//   };

//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       title={isEdit ? 'Chỉnh sửa Price List' : 'Tạo Price List'}
//       okText="Lưu"
//       onOk={() => form.submit()}
//       width={900}
//       destroyOnClose
//     >
//       <Spin spinning={isLoadingProducts}>
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={onFinish}
//           initialValues={defaultValues}
//         >
//           <Form.Item
//             name="title"
//             label="Tên Price List"
//             rules={[{ required: true, message: 'Vui lòng nhập tên Price List' }]}
//           >
//             <Input placeholder="Nhập tiêu đề" />
//           </Form.Item>

//           <Form.Item name="description" label="Mô tả">
//             <Input.TextArea rows={3} placeholder="Mô tả (tuỳ chọn)" />
//           </Form.Item>

//           <Form.Item label="Thời gian áp dụng">
//             <Input.Group compact>
//               <Form.Item
//                 name="start_date"
//                 noStyle
//                 rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}
//               >
//                 <DatePicker style={{ width: '50%' }} placeholder="Ngày bắt đầu" />
//               </Form.Item>
//               <Form.Item name="end_date" noStyle>
//                 <DatePicker style={{ width: '50%' }} placeholder="Ngày kết thúc (tuỳ chọn)" />
//               </Form.Item>
//             </Input.Group>
//           </Form.Item>

//           <Form.Item label="Thiết lập giá tuỳ chỉnh cho sản phẩm">
//             <ProductPriceTable
//               products={productsData?.data || []}
//               selectedRows={selectedRows}
//               setSelectedRows={setSelectedRows}
//               prices={prices}
//               setPrices={setPrices}
//             />
//           </Form.Item>
//         </Form>
//       </Spin>
//     </Modal>
//   );
// };

// export default PriceListModal;
