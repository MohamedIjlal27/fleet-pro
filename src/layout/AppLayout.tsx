import React, { useEffect, useRef, useState } from 'react';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { Outlet } from 'react-router';
import AppHeader from './AppHeader';
import Backdrop from './Backdrop';
import AppSidebar from './AppSidebar';
import { getBusinessInfo } from '@/utils/api';
import defaultLogo from '/src/assets/logo.svg';
import defaultLogoDark from '/src/assets/logo-dark.svg';
import defaultLogoSmall from '/src/assets/logo-sm.png';

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [logo, setLogo] = useState<string>('');
  const [logoDark, setLogoDark] = useState<string>('');
  const [smLogo, setSmLogo] = useState<string>('');

  const sidebarLogo = logo ? logo : defaultLogoDark;
  const sidebarLogoDark = logoDark ? logoDark : defaultLogo;
  const sidebarLogoSmall = smLogo ? smLogo : defaultLogoSmall;

  useEffect(() => {
    getBusinessInfo().then((data) => {
      //console.log('Got business info', data);
      setLogo(data.metadata.biz_icon);
      setLogoDark(data.metadata.biz_icon_dark);
      setSmLogo(data.metadata.biz_icon_small);
    });
  }, []);

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar
          sidebarLogo={sidebarLogo}
          sidebarLogoDark={sidebarLogoDark}
          sidebarLogoSmall={sidebarLogoSmall}
        />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered
            ? 'lg:ml-[290px] lg:w-[calc(100vw-290px)]'
            : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <AppHeader
          sidebarLogo={sidebarLogo}
          sidebarLogoDark={sidebarLogoDark}
          sidebarLogoSmall={sidebarLogoSmall}
        />
        <div className="md:p-4 w-full h-[calc(100vh-65px)] overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
