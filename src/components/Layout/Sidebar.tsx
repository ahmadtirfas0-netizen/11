import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Mail as MailIcon,
  Users, 
  Building2, 
  FolderOpen, 
  Search,
  Upload,
  MessageSquare,
  BarChart3,
  FileText,
  Shield,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { to: '/dashboard', icon: Home, label: 'لوحة التحكم', roles: ['admin', 'manager', 'head'] },
      { to: '/mails', icon: MailIcon, label: 'المراسلات', roles: ['admin', 'manager', 'head'] },
      { to: '/search', icon: Search, label: 'البحث المتقدم', roles: ['admin', 'manager', 'head'] },
    ];

    const managerItems = [
      { to: '/upload', icon: Upload, label: 'رفع مراسلة', roles: ['admin', 'manager'] },
    ];

    const adminItems = [
      { to: '/admin/departments', icon: Building2, label: 'إدارة الإدارات', roles: ['admin'] },
      { to: '/admin/sections', icon: FolderOpen, label: 'إدارة الأقسام', roles: ['admin'] },
      { to: '/admin/users', icon: Users, label: 'إدارة المستخدمين', roles: ['admin'] },
      { to: '/analytics', icon: BarChart3, label: 'التحليلات', roles: ['admin', 'manager'] },
      { to: '/reports', icon: FileText, label: 'التقارير', roles: ['admin', 'manager'] },
      { to: '/audit', icon: Shield, label: 'سجل المراجعة', roles: ['admin'] },
      { to: '/admin/settings', icon: Settings, label: 'إعدادات النظام', roles: ['admin'] },
    ];

    const headItems = [
      { to: '/referrals', icon: MessageSquare, label: 'الإحالات المطلوبة', roles: ['head'] },
    ];

    const allItems = [...baseItems, ...managerItems, ...adminItems, ...headItems];
    return allItems.filter(item => item.roles.includes(user?.role || ''));
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col" dir="rtl">
      {/* Logo and Title */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">نظام الأرشفة</h1>
            <p className="text-sm text-gray-500">الإلكتروني</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.fullName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' && 'مدير النظام'}
              {user?.role === 'manager' && 'مدير إدارة'}
              {user?.role === 'head' && 'رئيس قسم'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5 ml-3" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5 ml-3" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;