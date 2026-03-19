import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '@/App.tsx';
import GamePage from '@/pages/Game';
import Landing from '@/pages/Landing';

const routerConfig = [
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/game', element: <GamePage /> }
    ]
  }
];

const router = createBrowserRouter(routerConfig);

export const Router = () => {
  return <RouterProvider router={router} />;
};
