import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout';
import { HomeScreen } from '../pages/home';
import { CheckoutScreen } from '../pages/checkout';
import { SignInScreen } from '../pages/auth';
import { AdminLayout } from '../admin/components/layout';
import { DashboardAdmin } from '../admin/features/dashboard';
import { ProductManager } from '../admin/features/product';
import NotFoundScreen from '../pages/NotFoundScreen';
import ProductEditor from '../admin/features/product/ProductEditor';

const mainRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomeScreen />,
      },
      {
        path: '/checkout',
        element: <CheckoutScreen />,
      },
      {
        path: '/sign-in',
        element: <SignInScreen />,
      },
      {
        path: '*',
        element: <NotFoundScreen />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardAdmin />,
      },
      {
        path: 'product',
        element: <ProductManager />,
      },
      {
        path: 'product/create',
        element: <ProductEditor />,
      },
      {
        path: 'product/edit/:id',
        element: <ProductEditor />,
      },
      {
        path: '*',
        element: <NotFoundScreen />,
      },
    ],
  },
]);

export default mainRouter;
