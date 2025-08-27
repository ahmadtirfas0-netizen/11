import React, { useState } from 'react';
import { Search, Filter, Calendar, Building, FileText as FileIcon } from 'lucide-react';
import { SearchFilters, Department } from '../../types';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  departments: Department[];
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, departments, isLoading }) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
  };

  const handleInputChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  return (
    <div className="card" dir="rtl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الموضوع..."
                value={filters.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="input pr-10"
              />
            </div>
          </div>
          <div className="w-48">
            <input
              type="text"
              placeholder="الرقم الإشاري"
              value={filters.referenceNumber || ''}
              onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
              className="input"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            بحث متقدم
          </button>
        </div>

        {/* Advanced Search */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline ml-2" />
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleInputChange('dateFrom', e.target.value)}
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
                value={filters.dateTo || ''}
                onChange={(e) => handleInputChange('dateTo', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline ml-2" />
                الإدارة
              </label>
              <select
                value={filters.departmentId || ''}
                onChange={(e) => handleInputChange('departmentId', e.target.value)}
                className="select"
              >
                <option value="">جميع الإدارات</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileIcon className="w-4 h-4 inline ml-2" />
                نوع المراسلة
              </label>
              <select
                value={filters.direction || ''}
                onChange={(e) => handleInputChange('direction', e.target.value)}
                className="select"
              >
                <option value="">جميع الأنواع</option>
                <option value="incoming">وارد</option>
                <option value="outgoing">صادر</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'جاري البحث...' : 'بحث'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
            >
              إعادة تعيين
            </button>
          </div>

          {Object.keys(filters).some(key => filters[key as keyof SearchFilters]) && (
            <div className="text-sm text-gray-500">
              يتم البحث بـ {Object.keys(filters).filter(key => filters[key as keyof SearchFilters]).length} معيار
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;