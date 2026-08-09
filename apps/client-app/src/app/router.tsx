import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.js';

export const clientRouteDefinitions = [
  { path: '/', element: <h1>Emme</h1> },
] as const;

const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: clientRouteDefinitions[0].element },
  ...clientRouteDefinitions.slice(1).map(({ path, element }) => ({ path: path.slice(1), element })),
] }]);
export function ClientRouter() { return <RouterProvider router={router} />; }
