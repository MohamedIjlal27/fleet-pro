import { useSidebar } from "../context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.5)] lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
