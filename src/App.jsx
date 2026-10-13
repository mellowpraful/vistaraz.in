import React from 'react';
import AppRoutes from './routes/AppRoutes';
import './styles/variables.css';
import './styles/global.css';
import './styles/responsive.css';

/**
 * Vistaraz Application Root
 * Top-level application component with global style imports and route rendering.
 */
export default function App() {
  return (
    <div className="vistaraz-app">
      <AppRoutes />
    </div>
  );
}
