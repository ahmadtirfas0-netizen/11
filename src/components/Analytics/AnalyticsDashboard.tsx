import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { TrendingUp, Mail as MailIcon, Building, Users, Calendar, Activity } from 'lucide-react';
import type { Mail, Department } from '../../types';

interface AnalyticsDashboardProps {
  mails: Mail[];
  departments: Department[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ mails, departments }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analytics, setAnalytics] = useState({
    totalMails: 0,
    incomingMails: 0,
    outgoingMails: 0,
    averagePerDay: 0,
    topDepartments: [] as { name: string; count: number; color: string }[],
    monthlyTrend: [] as { month: string; incoming: number; outgoing: number }[],
    dailyActivity: [] as { day: string; count: number }[]
  });

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  useEffect(() => {
    calculateAnalytics();
  }, [mails, departments, timeRange]);

  const calculateAnalytics = () => {
    const now = new Date();
    const startDate = getStartDate(now, timeRange);
    
    const filteredMails = mails.filter(mail => 
      new Date(mail.mailDate) >= startDate
    );

    // Basic stats
    const totalMails = filteredMails.length;
    const incomingMails = filteredMails.filter(m => m.direction === 'incoming').length;
    const outgoingMails = filteredMails.filter(m => m.direction === 'outgoing').length;
    const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averagePerDay = Math.round(totalMails / days);

    // Top departments
    const deptCounts = new Map<string, number>();
    filteredMails.forEach(mail => {
      const deptName = mail.fromDepartment?.name || mail.toDepartment?.name || 'غير محدد';
      deptCounts.set(deptName, (deptCounts.get(deptName) || 0) + 1);
    });

    const topDepartments = Array.from(deptCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count], index) => ({
        name,
        count,
        color: colors[index % colors.length]
      }));

    // Monthly trend
    const monthlyData = new Map<string, { incoming: number; outgoing: number }>();
    filteredMails.forEach(mail => {
      const month = new Date(mail.mailDate).toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { incoming: 0, outgoing: 0 });
      }
      
      const data = monthlyData.get(month)!;
      if (mail.direction === 'incoming') {
        data.incoming++;
      } else {
        data.outgoing++;
      }
    });

    const monthlyTrend = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Daily activity (last 7 days)
    const dailyData = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toLocaleDateString('ar-SA', { weekday: 'short' });
      const dayMails = filteredMails.filter(mail => 
        new Date(mail.mailDate).toDateString() === date.toDateString()
      ).length;
      dailyData.set(dayKey, dayMails);
    }

    const dailyActivity = Array.from(dailyData.entries())
      .map(([day, count]) => ({ day, count }));

    setAnalytics({
      totalMails,
      incomingMails,
      outgoingMails,
      averagePerDay,
      topDepartments,
      monthlyTrend,
      dailyActivity
    });
  };

  const getStartDate = (now: Date, range: string) => {
    const date = new Date(now);
    switch (range) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    return date;
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }: any) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm flex items-center mt-2 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 ml-1" />
              {Math.abs(change)}% من الفترة السابقة
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم التحليلية</h1>
          <p className="text-gray-600 mt-2">تحليل شامل لأداء نظام المراسلات</p>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="select"
          >
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="quarter">آخر 3 أشهر</option>
            <option value="year">آخر سنة</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={MailIcon}
          title="إجمالي المراسلات"
          value={analytics.totalMails}
          change={12}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          title="المراسلات الواردة"
          value={analytics.incomingMails}
          change={8}
          color="green"
        />
        <StatCard
          icon={Activity}
          title="المراسلات الصادرة"
          value={analytics.outgoingMails}
          change={-3}
          color="amber"
        />
        <StatCard
          icon={Calendar}
          title="المعدل اليومي"
          value={analytics.averagePerDay}
          change={5}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الاتجاه الشهري</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="incoming" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="واردة"
              />
              <Area 
                type="monotone" 
                dataKey="outgoing" 
                stackId="1"
                stroke="#F59E0B" 
                fill="#F59E0B" 
                fillOpacity={0.6}
                name="صادرة"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Departments */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أكثر الإدارات نشاطاً</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.topDepartments}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.topDepartments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط اليومي (آخر 7 أيام)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Comparison */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مقارنة الإدارات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topDepartments} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600 ml-3" />
            <div>
              <h4 className="font-semibold text-blue-900">اتجاه إيجابي</h4>
              <p className="text-sm text-blue-700">زيادة 12% في المراسلات هذا الشهر</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-green-600 ml-3" />
            <div>
              <h4 className="font-semibold text-green-900">أكثر الإدارات نشاطاً</h4>
              <p className="text-sm text-green-700">
                {analytics.topDepartments[0]?.name || 'لا توجد بيانات'}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-amber-600 ml-3" />
            <div>
              <h4 className="font-semibold text-amber-900">ذروة النشاط</h4>
              <p className="text-sm text-amber-700">
                {analytics.dailyActivity.reduce((max, day) => 
                  day.count > max.count ? day : max, analytics.dailyActivity[0] || { day: '', count: 0 }
                ).day || 'لا توجد بيانات'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;