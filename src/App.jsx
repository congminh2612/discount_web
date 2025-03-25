import { RouterProvider } from 'react-router-dom';
import mainRouter from './router/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/i18n/i18n';
import { useEffect } from 'react';
import i18n from '@/i18n/i18n';
import { useSelector } from 'react-redux';
import { CartProvider } from '@/context/CartContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const language = useSelector((state) => state.language.language);
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={mainRouter} />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;