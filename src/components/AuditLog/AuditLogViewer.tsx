import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Calendar, User, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
}

const AuditLogViewer: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters, searchTerm]);

  const loadAuditLogs = async () => {
    try {
      // Mock data - في التطبيق الحقيقي، سيتم جلب البيانات من الـ API
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: 'LOGIN',
          resource: 'AUTH',
          resourceId: 'session-123',
          details: 'تسجيل دخول ناجح',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date().toISOString(),
          status: 'success'
        },
        {
          id: '2',
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: 'CREATE_MAIL',
          resource: 'MAIL',
          resourceId: 'mail-456',
          details: 'إنشاء مراسلة جديدة: طلب تحديث الأنظمة',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'success'
        },
        {
          id: '3',
          userId: 'user-789',
          userName: 'أحمد محمد',
          action: 'VIEW_MAIL',
          resource: 'MAIL',
          resourceId: 'mail-456',
          details: 'عرض تفاصيل المراسلة',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          userId: 'user-101',
          userName: 'سارة أحمد',
          action: 'FAILED_LOGIN',
          resource: 'AUTH',
          resourceId: 'session-789',
          details: 'محاولة تسجيل دخول فاشلة - كلمة مرور خاطئة',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          status: 'failed'
        },
        {
          id: '5',
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: 'UPDATE_USER',
          resource: 'USER',
          resourceId: 'user-202',
          details: 'تحديث بيانات المستخدم: تغيير الدور',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          status: 'warning'
        }
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateTo)
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return <User className="w-4 h-4" />;
      case 'CREATE_MAIL':
      case 'UPDATE_MAIL':
      case 'DELETE_MAIL':
        return <Activity className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionName = (action: string) => {
    const actionNames: { [key: string]: string } = {
      'LOGIN': 'تسجيل دخول',
      'LOGOUT': 'تسجيل خروج',
      'FAILED_LOGIN': 'فشل تسجيل دخول',
      'CREATE_MAIL': 'إنشاء مراسلة',
      'UPDATE_MAIL': 'تحديث مراسلة',
      'DELETE_MAIL': 'حذف مراسلة',
      'VIEW_MAIL': 'عرض مراسلة',
      'CREATE_USER': 'إنشاء مستخدم',
      'UPDATE_USER': 'تحديث مستخدم',
      'DELETE_USER': 'حذف مستخدم'
    };
    return actionNames[action] || action;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="card text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">غير مصرح</h3>
        <p className="text-gray-500">هذه الصفحة متاحة لمديري النظام فقط</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">سجل مراجعة العمليات</h1>
          <p className="text-gray-600 mt-2">تتبع جميع العمليات والأنشطة في النظام</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline ml-2" />
              البحث
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في التفاصيل..."
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Activity className="w-4 h-4 inline ml-2" />
              نوع العملية
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="select"
            >
              <option value="">جميع العمليات</option>
              <option value="LOGIN">تسجيل دخول</option>
              <option value="CREATE_MAIL">إنشاء مراسلة</option>
              <option value="UPDATE_MAIL">تحديث مراسلة</option>
              <option value="VIEW_MAIL">عرض مراسلة</option>
              <option value="CREATE_USER">إنشاء مستخدم</option>
              <option value="UPDATE_USER">تحديث مستخدم</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline ml-2" />
              الحالة
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="select"
            >
              <option value="">جميع الحالات</option>
              <option value="success">نجح</option>
              <option value="failed">فشل</option>
              <option value="warning">تحذير</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline ml-2" />
              من تاريخ
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline ml-2" />
              إلى تاريخ
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            عرض {filteredLogs.length} من أصل {logs.length} عملية
          </p>
          <button
            onClick={() => {
              setFilters({ action: '', userId: '', dateFrom: '', dateTo: '', status: '' });
              setSearchTerm('');
            }}
            className="btn btn-secondary btn-sm"
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">التوقيت</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">العملية</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">التفاصيل</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">عنوان IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2">جاري التحميل...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لا توجد عمليات تطابق المعايير المحددة</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 ml-2" />
                        {log.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className="mr-2">{getActionName(log.action)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="max-w-xs truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                        {log.status === 'success' ? 'نجح' : 
                         log.status === 'failed' ? 'فشل' : 'تحذير'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;