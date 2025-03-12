import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';

const breadcrumbMap = {
  '/admin': 'Trang chủ',
  '/admin/product': 'Sản phẩm',
  '/admin/product/create': 'Thêm sản phẩm',
  '/admin/orders': 'Đơn hàng',
  '/admin/discounts': 'Giảm giá',
  '/admin/discount/cp/create': 'Tạo custom pricing', // ✅ Fix ở đây
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Breadcrumb style={{ marginBottom: 16 }}>
      {pathnames.map((segment, index) => {
        let url = `/${pathnames.slice(0, index + 1).join('/')}`;
        const breadcrumbLabel = breadcrumbMap[url];

        if (!breadcrumbLabel) return null;

        return (
          <Breadcrumb.Item key={url}>
            <Link to={url}>{breadcrumbLabel}</Link>
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
