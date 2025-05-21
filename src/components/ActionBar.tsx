import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  MessageSquarePlus, 
  Database, 
  Brain, 
  X, 
  ChevronRight,
  Image,
  MousePointer,
  FormInput,
  Component,
  Clock,
  Settings,
  Code,
  Play as PlayIcon,
  Timer
} from 'lucide-react';

interface ActionDropdownProps {
  isOpen: boolean;
  items: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
  }[];
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ isOpen, items }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50">
      {items.map((item, index) => (
        <button
          key={index}
          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          onClick={item.onClick}
        >
          <item.icon size={16} className="text-gray-500" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const ActionBar = () => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const actionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hoveredAction && !actionRefs.current[hoveredAction]?.contains(event.target as Node)) {
        setHoveredAction(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [hoveredAction]);

  const actions = [
    {
      icon: Play,
      label: 'Start',
      items: []
    },
    {
      icon: MessageSquarePlus,
      label: 'Add Message',
      items: [
        {
          icon: Image,
          label: 'Capture',
          onClick: () => console.log('Capture clicked')
        },
        {
          icon: MousePointer,
          label: 'Buttons',
          onClick: () => console.log('Buttons clicked')
        },
        {
          icon: FormInput,
          label: 'Form',
          onClick: () => console.log('Form clicked')
        }
      ]
    },
    {
      icon: Database,
      label: 'Listen',
      items: [
        {
          icon: Database,
          label: 'Database',
          onClick: () => console.log('Database clicked')
        },
        {
          icon: Clock,
          label: 'Schedule',
          onClick: () => console.log('Schedule clicked')
        },
        {
          icon: Settings,
          label: 'Webhook',
          onClick: () => console.log('Webhook clicked')
        }
      ]
    },
    {
      icon: Brain,
      label: 'AI',
      items: [
        {
          icon: Component,
          label: 'AI Response',
          onClick: () => console.log('AI Response clicked')
        }
      ]
    },
    {
      icon: X,
      label: 'Logic',
      items: [
        {
          icon: Component,
          label: 'Condition',
          onClick: () => console.log('Condition clicked')
        }
      ]
    },
    {
      icon: ChevronRight,
      label: 'Advance',
      items: [
        {
          icon: Code,
          label: 'Code Execution',
          onClick: () => console.log('Code Execution clicked')
        },
        {
          icon: Component,
          label: 'Component',
          onClick: () => console.log('Component clicked')
        },
        {
          icon: PlayIcon,
          label: 'Action',
          onClick: () => console.log('Action clicked')
        },
        {
          icon: Timer,
          label: 'Wait',
          onClick: () => console.log('Wait clicked')
        }
      ]
    }
  ];

  return (
    <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-white">
      <div className="flex items-center space-x-4">
        {actions.map((action, index) => (
          <div 
            key={index} 
            className="relative"
            ref={el => actionRefs.current[action.label] = el}
            onMouseEnter={() => {
              clearHoverTimeout();
              if (action.items.length > 0) {
                setHoveredAction(action.label);
              }
            }}
            onMouseLeave={() => {
              clearHoverTimeout();
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredAction(null);
              }, 100);
            }}
          >
            <button
              className={`flex items-center space-x-1 px-2 py-1 rounded ${
                hoveredAction === action.label
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <action.icon size={16} />
              <span className="text-sm">{action.label}</span>
            </button>
            <ActionDropdown
              isOpen={hoveredAction === action.label}
              items={action.items}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionBar;