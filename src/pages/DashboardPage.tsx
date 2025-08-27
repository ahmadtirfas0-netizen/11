import React, { useEffect, useState } from 'react';
import { 
  Mail as MailIcon,
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Building, 
  Users, 
  FileText as FileIcon,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Mail as MailType } from '../types';
import { mailService } from '../services/mail';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/Common/StatusBadge';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [recentMails, setRecentMails] = useState<MailType[]>([]);
  const [stats, setStats] = useState({
    totalMails: 0,
    pendingReferrals: 0,
    completedToday: 0,
    departments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load recent mails
        const mailsResponse = await mailService.getAllMails(1, 5);
        setRecentMails(mailsResponse.data);
        
        // Mock stats - in real app, these would come from API
        setStats({
          totalMails: mailsResponse.meta.total,
          pendingReferrals: 12,
          completedToday: 8,
          departments: 5
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
    });
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }: any) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-2 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 ml-1" />
              {Math.abs(change)}% من الأمس
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}، {user?.fullName}
        </h1>
        <p className="text-blue-100 text-lg">
          مرحباً بك في نظام إدارة المراسلات الإلكترونية
        </p>
        <div className="mt-4 flex items-center text-blue-100">
          <Clock className="w-5 h-5 ml-2" />
          <span>{new Date().toLocaleDateString('ar-SA', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={MailIcon}
          title="إجمالي المراسلات"
          value={stats.totalMails}
          change={8}
          color="blue"
        />
        <StatCard
          icon={AlertCircle}
          title="الإحالات المعلقة"
          value={stats.pendingReferrals}
          change={-5}
          color="amber"
        />
        <StatCard
          icon={CheckCircle}
          title="مكتملة اليوم"
          value={stats.completedToday}
          change={15}
          color="green"
        />
        <StatCard
          icon={Building}
          title="الإدارات النشطة"
          value={stats.departments}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mails */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 ml-3 text-blue-600" />
              المراسلات الحديثة
            </h2>
            <Link to="/mails" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              عرض الكل
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentMails.map((mail, index) => (
                <div key={mail.id} className={`flex justify-between items-center py-3 ${
                  index < recentMails.length - 1 ? 'border-b border-gray-100' : ''
                }`}>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/mails/${mail.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {mail.subject}
                    </Link>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span>{mail.referenceNumber}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(mail.mailDate)}</span>
                    </div>
                  </div>
                  <StatusBadge status={mail.direction} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 ml-3 text-blue-600" />
            إجراءات سريعة
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/users" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Users className="w-8 h-8 text-blue-600 ml-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">إدارة المستخدمين</h3>
                    <p className="text-sm text-gray-600">إضافة وتعديل المستخدمين</p>
                  </div>
                </Link>
                <Link to="/admin/departments" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Building className="w-8 h-8 text-green-600 ml-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">إدارة الإدارات</h3>
                    <p className="text-sm text-gray-600">تنظيم الهيكل التنظيمي</p>
                  </div>
                </Link>
              </>
            )}
            
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link to="/upload" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <MailIcon className="w-8 h-8 text-purple-600 ml-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">رفع مراسلة جديدة</h3>
                  <p className="text-sm text-gray-600">إضافة مراسلة للنظام</p>
                </div>
              </Link>
            )}
            
            <Link to="/search" className="flex items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <FileText className="w-8 h-8 text-amber-600 ml-4" />
              <div>
                <h3 className="font-semibold text-gray-900">البحث المتقدم</h3>
                <p className="text-sm text-gray-600">العثور على المراسلات</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;