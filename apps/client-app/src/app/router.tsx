import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.js';
import { ClientOidcCallbackPage } from '../features/auth/ClientOidcCallbackPage.js';

export const clientRouteDefinitions = [
  { path: '/', element: <h1>Emme</h1> },
  { path: '/auth/callback', element: <ClientOidcCallbackPage /> },
] as const;

const authenticatedRouter = createBrowserRouter([
  { path: clientRouteDefinitions[1].path, element: clientRouteDefinitions[1].element },
  { path: '/', element: <App />, children: [
    { index: true, element: clientRouteDefinitions[0].element },
  ] },
]);
export function ClientRouter() { return <RouterProvider router={authenticatedRouter} />; }
