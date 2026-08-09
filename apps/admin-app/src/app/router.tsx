import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.js';

export const platformRouteDefinitions = [
  { path: '/', element: <h1>Platform admin</h1> },
] as const;

const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: platformRouteDefinitions[0].element },
  ...platformRouteDefinitions.slice(1).map(({ path, element }) => ({ path: path.slice(1), element })),
] }]);
export function PlatformAdminRouter() { return <RouterProvider router={router} />; }
