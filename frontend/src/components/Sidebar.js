import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  BarChart3, 
  Settings, 
  Plus,
  History,
  Menu
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  const menuItems = [
    {
      name: 'Create QR',
      path: '/create',
      icon: Plus,
    },
    {
      name: 'My QR Codes',
      path: '/qr-codes',
      icon: QrCode,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'History',
      path: '/history',
      icon: History,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.sidebar-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Toggle Button - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sidebar-toggle fixed top-4 left-4 z-50 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          {/* Dashboard Title */}
          <div className="mb-8">
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              <h2 className="text-2xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer">
                Dashboard
              </h2>
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-center">
            <h3 className="font-semibold text-sm mb-2">Upgrade to Pro</h3>
            <p className="text-xs opacity-90 mb-3">
              Get unlimited QR codes and advanced analytics
            </p>
            <button className="w-full bg-white text-blue-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;