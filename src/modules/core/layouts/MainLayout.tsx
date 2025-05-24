import React, { ReactNode, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children?: ReactNode;
}

const minWidth = "1280px";

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    // Create a media query listener
    const mediaQuery = window.matchMedia(`(max-width: 1520px)`);

    // Define a handler for media query changes
    const handleMediaQueryChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsSidebarCollapsed(event.matches); // Collapse sidebar if viewport width <= 1280px
    };

    // Initialize the state based on the current viewport size
    handleMediaQueryChange(mediaQuery);

    // Add the event listener
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main content area */}
      <div
        className="flex flex-col flex-1 "
        style={{ overflowX: 'auto'}}
      >
        {/* Navbar */}
        <div style={{  minWidth: minWidth,  }}>
          <Navbar onToggleSidebar={toggleSidebar} />
        </div>

        {/* Main content */}
        <div className="flex-1 p-2" style={{ minWidth: minWidth,  overflowX: 'auto'}}>
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MainLayout);
