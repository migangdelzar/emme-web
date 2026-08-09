import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.js';
const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: <h1>Platform admin</h1> },
  { path: 'tenants', element: <h1>Tenants</h1> },
  { path: 'memberships', element: <h1>Memberships</h1> },
  { path: 'audit', element: <h1>Audit</h1> },
  { path: 'subscriptions', element: <h1>Subscriptions</h1> },
] }]);
export function PlatformAdminRouter() { return <RouterProvider router={router} />; }
