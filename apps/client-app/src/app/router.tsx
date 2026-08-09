import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.js';
import { AppointmentsPage } from '../features/appointments/AppointmentsPage.js';
import { BookingPage } from '../features/booking/BookingPage.js';
import { CommunicationsPage } from '../features/communications/CommunicationsPage.js';
import { DiscoveryPage } from '../features/discovery/DiscoveryPage.js';
import { ProfilePage } from '../features/profile/ProfilePage.js';

export const clientRouteDefinitions = [
  { path: '/', element: <h1>Emme</h1> },
  { path: '/discover', element: <DiscoveryPage /> },
  { path: '/book', element: <BookingPage /> },
  { path: '/appointments', element: <AppointmentsPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/messages', element: <CommunicationsPage /> },
] as const;

const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: clientRouteDefinitions[0].element },
  ...clientRouteDefinitions.slice(1).map(({ path, element }) => ({ path: path.slice(1), element })),
] }]);
export function ClientRouter() { return <RouterProvider router={router} />; }
