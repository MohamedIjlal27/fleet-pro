import React, { ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';

interface EmptyLayoutProps {
  children?: ReactNode;
}

const EmptyLayout: React.FC<EmptyLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main content area */}
      <div
        className="flex flex-col flex-1 overflow-auto"
        style={{ overflowX: 'auto' }}
      >
        {/* Main content */}
        <div className="flex-1 p-4" style={{ minWidth: '1024px' }}>
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(EmptyLayout);
