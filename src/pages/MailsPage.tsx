import React, { useEffect, useState } from 'react';
import type { Mail } from '../types';
import { mailService } from '../services/mail';
import { adminService } from '../services/admin';
import MailTable from '../components/Mail/MailTable';
import SearchBar from '../components/Mail/SearchBar';
import { Plus, Filter, FileText as FileIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MailsPage: React.FC = () => {
  const { user } = useAuth();
  const [mails, setMails] = useState<Mail[]>([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [mailsResponse, departmentsResponse] = await Promise.all([
        mailService.getAllMails(1, 10),
        adminService.getAllDepartments()
      ]);
      
      setMails(mailsResponse.data);
      setTotalPages(mailsResponse.meta.totalPages);
      setDepartments(departmentsResponse);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (filters: any) => {
    try {
      setIsLoading(true);
      const response = await mailService.searchMails(filters, 1, 10);
      setMails(response.data);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching mails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canUploadMail = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المراسلات</h1>
          <p className="text-gray-600 mt-2">عرض وإدارة جميع المراسلات الواردة والصادرة</p>
        </div>
        
        {canUploadMail && (
          <Link
            to="/upload"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            مراسلة جديدة
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        departments={departments}
        isLoading={isLoading}
      />

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">{mails.length}</p>
              <p className="text-sm text-gray-600">إجمالي المراسلات</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                {mails.filter(m => m.direction === 'incoming').length}
              </p>
              <p className="text-sm text-gray-600">واردة</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                {mails.filter(m => m.direction === 'outgoing').length}
              </p>
              <p className="text-sm text-gray-600">صادرة</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                {mails.filter(m => m.attachments && m.attachments.length > 0).length}
              </p>
              <p className="text-sm text-gray-600">بمرفقات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mails Table */}
      <MailTable 
        mails={mails}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            السابق
          </button>
          
          <div className="flex space-x-1 space-x-reverse">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default MailsPage;