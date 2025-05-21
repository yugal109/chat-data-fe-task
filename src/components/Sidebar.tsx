import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SidebarProps {
  isVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  return (
    <div className={`w-64 bg-gray-50 border-r border-gray-200 h-screen transition-all duration-300 ${
      isVisible ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search intents, events..."
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3">SCENARIOS</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-blue-50 text-blue-600 rounded-md">
            <span className="text-sm">Book-Available</span>
            <ChevronRight size={16} />
          </div>
        </div>
        <h3 className="text-xs font-semibold text-gray-500 mt-6 mb-3">COMPONENTS</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
            <span className="text-sm">AvailableRooms</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;