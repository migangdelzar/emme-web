import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.js';

export const adminRouteDefinitions = [
  { path: '/', element: <h1>Admin</h1> },
] as const;

const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: adminRouteDefinitions[0].element },
  ...adminRouteDefinitions.slice(1).map(({ path, element }) => ({ path: path.slice(1), element })),
] }]);
export function AdminRouter() { return <RouterProvider router={router} />; }
