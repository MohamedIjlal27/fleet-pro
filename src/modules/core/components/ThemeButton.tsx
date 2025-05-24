import React from 'react';

interface ButtonProps {
  onClick: () => void;
  name: string;
  icon?: React.ReactNode; // Optional icon parameter
  style?: string; // Optional style parameter
}

const ThemeButton: React.FC<ButtonProps> = ({ onClick, name, icon, style }) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-md bg-[#0A1224] py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-bg-[#0A1224]/80 focus:shadow-none active:bg-[#0A1224]/80 hover:bg-[#0A1224]/80 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2 text-nowrap ${style}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {name}
    </button>
  );
};

export default ThemeButton;
