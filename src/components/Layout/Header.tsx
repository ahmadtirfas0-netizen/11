import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../Notifications/NotificationCenter';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" dir="rtl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Page Title - This will be dynamic based on current route */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">لوحة التحكم</h2>
          <p className="text-sm text-gray-500 mt-1">نظام إدارة المراسلات الإلكترونية</p>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث السريع..."
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Avatar */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">
                {user?.department?.name}
                {user?.section && ` - ${user.section.name}`}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.fullName?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;