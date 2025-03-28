// // src/pages/payment/PaymentSuccess.jsx
// import React from 'react';
// import { Result, Button } from 'antd';
// import { useNavigate, useSearchParams } from 'react-router-dom';

// const PaymentSuccess = () => {
//   const [params] = useSearchParams();
//   const navigate = useNavigate();
//   const orderId = params.get('orderId');

//   return (
//     <Result
//       status="success"
//       title="Thanh toán thành công!"
//       subTitle={`Cảm ơn bạn đã thanh toán. Mã đơn hàng: ${orderId}`}
//       extra={[
//         <Button type="primary" onClick={() => navigate('/')} key="home">Trang chủ</Button>,
//         <Button onClick={() => navigate(`/order-success/${orderId}`)} key="detail">Xem đơn hàng</Button>,
//       ]}
//     />
//   );
// };

// export default PaymentSuccess;
