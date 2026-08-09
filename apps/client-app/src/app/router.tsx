import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.js';
const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: <h1>Emme</h1> },
  { path: 'discover', element: <h1>Discover services</h1> },
  { path: 'book', element: <h1>Book an appointment</h1> },
  { path: 'appointments', element: <h1>My appointments</h1> },
  { path: 'profile', element: <h1>My profile</h1> },
] }]);
export function ClientRouter() { return <RouterProvider router={router} />; }
