import React from 'react';
import type { Mail } from '../../types';
import { Eye, Download, Share2, Calendar, Building, FileText as FileIcon } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';
import { Link } from 'react-router-dom';

interface MailTableProps {
  mails: Mail[];
  isLoading?: boolean;
  onViewMail?: (mailId: string) => void;
}

const MailTable: React.FC<MailTableProps> = ({ mails, isLoading, onViewMail }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex space-x-4 space-x-reverse">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mails.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 mb-4">
          <FileIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراسلات</h3>
        <p className="text-gray-500">لم يتم العثور على مراسلات تطابق معايير البحث</p>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900" dir="rtl">قائمة المراسلات</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الرقم الإشاري</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الموضوع</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">التاريخ</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">النوع</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الإدارة</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">المرفقات</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mails.map((mail) => (
              <tr key={mail.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-blue-600">
                  {mail.referenceNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={mail.subject}>
                    {mail.subject}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 ml-2" />
                    {formatDate(mail.mailDate)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={mail.direction} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 ml-2" />
                    {mail.direction === 'incoming' 
                      ? mail.fromDepartment?.name 
                      : mail.toDepartment?.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {mail.attachments?.length || 0} ملف
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Link
                      to={`/mails/${mail.id}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button 
                      className="text-green-600 hover:text-green-700 transition-colors"
                      title="إحالة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-700 transition-colors"
                      title="تحميل المرفقات"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MailTable;