import { Outlet } from 'react-router-dom';
import { AppProviders } from './AppProviders.js';
export function App() { return <AppProviders><main><Outlet /></main></AppProviders>; }
