import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.js';
import { AuditPage } from '../features/audit/AuditPage.js';
import { MembershipsPage } from '../features/memberships/MembershipsPage.js';
import { SubscriptionsPage } from '../features/subscriptions/SubscriptionsPage.js';
import { TenantManagementPage } from '../features/tenant-management/TenantManagementPage.js';

export const platformRouteDefinitions = [
  { path: '/', element: <h1>Platform admin</h1> },
  { path: '/tenants', element: <TenantManagementPage /> },
  { path: '/memberships', element: <MembershipsPage /> },
  { path: '/audit', element: <AuditPage /> },
  { path: '/subscriptions', element: <SubscriptionsPage /> },
] as const;

const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: platformRouteDefinitions[0].element },
  ...platformRouteDefinitions.slice(1).map(({ path, element }) => ({ path: path.slice(1), element })),
] }]);
export function PlatformAdminRouter() { return <RouterProvider router={router} />; }
