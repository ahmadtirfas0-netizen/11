import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, FileText as FileIcon } from 'lucide-react';
import { adminService } from '../services/admin';
import { mailService } from '../services/mail';
import SearchBar from '../components/Mail/SearchBar';
import MailTable from '../components/Mail/MailTable';
import type { Mail, Department, SearchFilters } from '../types';

const SearchPage: React.FC = () => {
  const [mails, setMails] = useState<Mail[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await adminService.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setIsLoading(true);
      setCurrentFilters(filters);
      
      const response = await mailService.searchMails(filters, 1, 50);
      setMails(response.data);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching mails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    // In a real application, this would generate and download a report
    const csvContent = [
      ['الرقم الإشاري', 'الموضوع', 'التاريخ', 'النوع', 'الإدارة'].join(','),
      ...mails.map(mail => [
        mail.referenceNumber,
        `"${mail.subject}"`,
        mail.mailDate,
        mail.direction === 'incoming' ? 'وارد' : 'صادر',
        mail.direction === 'incoming' ? mail.fromDepartment?.name : mail.toDepartment?.name
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `search-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">البحث المتقدم</h1>
          <p className="text-gray-600 mt-2">البحث في المراسلات باستخدام معايير متعددة</p>
        </div>
        
        {hasSearched && mails.length > 0 && (
          <button
            onClick={exportResults}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير النتائج
          </button>
        )}
      </div>

      {/* Search Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Search className="w-6 h-6 text-blue-600 ml-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">كيفية استخدام البحث المتقدم</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• يمكنك البحث باستخدام معيار واحد أو أكثر</li>
              <li>• استخدم التواريخ للبحث في فترة زمنية محددة</li>
              <li>• اختر الإدارة للبحث في مراسلات إدارة معينة</li>
              <li>• يمكن البحث بجزء من الموضوع أو الرقم الإشاري</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        departments={departments}
        isLoading={isLoading}
      />

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FileIcon className="w-5 h-5 text-gray-600 ml-2" />
              <span className="text-gray-900 font-medium">
                {isLoading ? 'جاري البحث...' : `تم العثور على ${mails.length} مراسلة`}
              </span>
            </div>
            
            {Object.keys(currentFilters).length > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <Filter className="w-4 h-4 ml-1" />
                <span>معايير البحث النشطة: {Object.keys(currentFilters).filter(key => currentFilters[key as keyof SearchFilters]).length}</span>
              </div>
            )}
          </div>

          {/* Results Table */}
          <MailTable 
            mails={mails}
            isLoading={isLoading}
          />

          {/* No Results */}
          {!isLoading && mails.length === 0 && (
            <div className="card text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على مراسلات تطابق معايير البحث المحددة</p>
              <div className="text-sm text-gray-400">
                <p>جرب:</p>
                <ul className="mt-2 space-y-1">
                  <li>• تعديل معايير البحث</li>
                  <li>• توسيع نطاق التواريخ</li>
                  <li>• استخدام كلمات مفتاحية أقل تحديداً</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="card text-center py-16">
          <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">ابدأ البحث</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            استخدم نموذج البحث أعلاه للعثور على المراسلات التي تحتاجها. 
            يمكنك البحث بالموضوع، الرقم الإشاري، التاريخ، أو الإدارة.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;