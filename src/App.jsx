// src/App.jsx
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div>
      {/* This Outlet component will render either your LoginPage or DashboardPage */}
      <Outlet />
    </div>
  );
}

export default App;