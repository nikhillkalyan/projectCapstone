import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Topbar />
      <main className="dashboard-content">
        <div className="dashboard-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
