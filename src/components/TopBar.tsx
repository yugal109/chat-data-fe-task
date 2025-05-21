import React from 'react';
import { Menu } from 'lucide-react';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  return (
    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Flows</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
          Emulator
        </button>
        <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
          Save
        </button>
        <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Publish
        </button>
      </div>
    </div>
  );
};

export default TopBar;