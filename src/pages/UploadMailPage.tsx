import React, { useState, useEffect } from 'react';
import { Upload, FileText as FileIcon, Calendar, Building, ArrowLeft, X, Scan } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/admin';
import { mailService } from '../services/mail';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import DocumentScanner from '../components/Scanner/DocumentScanner';
import { useNavigate } from 'react-router-dom';
import type { Department } from '../types';

const UploadMailPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    referenceNumber: '',
    mailDate: new Date().toISOString().split('T')[0],
    subject: '',
    direction: 'incoming' as 'incoming' | 'outgoing',
    fromDepartmentId: '',
    toDepartmentId: '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await adminService.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setIsDepartmentsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleScanComplete = (scannedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...scannedFiles]);
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Add files
      selectedFiles.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      await mailService.createMail(formDataToSend);
      
      // Success - redirect to mails page
      navigate('/mails');
    } catch (error) {
      console.error('Error uploading mail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isDepartmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">رفع مراسلة جديدة</h1>
          <p className="text-gray-600 mt-2">إضافة مراسلة جديدة إلى النظام مع المرفقات</p>
        </div>
        <button
          onClick={() => navigate('/mails')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للمراسلات
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <FileIcon className="w-6 h-6 ml-3 text-blue-600" />
            المعلومات الأساسية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرقم الإشاري *
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="أدخل الرقم الإشاري"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline ml-2" />
                تاريخ المراسلة *
              </label>
              <input
                type="date"
                name="mailDate"
                value={formData.mailDate}
                onChange={handleInputChange}
                required
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموضوع *
              </label>
              <textarea
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                rows={3}
                className="input resize-none"
                placeholder="أدخل موضوع المراسلة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المراسلة *
              </label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleInputChange}
                required
                className="select"
              >
                <option value="incoming">وارد</option>
                <option value="outgoing">صادر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline ml-2" />
                {formData.direction === 'incoming' ? 'من الإدارة' : 'إلى الإدارة'} *
              </label>
              <select
                name={formData.direction === 'incoming' ? 'fromDepartmentId' : 'toDepartmentId'}
                value={formData.direction === 'incoming' ? formData.fromDepartmentId : formData.toDepartmentId}
                onChange={handleInputChange}
                required
                className="select"
              >
                <option value="">اختر الإدارة</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Upload className="w-6 h-6 ml-3 text-blue-600" />
            المرفقات
          </h2>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="upload-area">
              <div className="flex items-center justify-center space-x-4 space-x-reverse mb-4">
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Scan className="w-5 h-5" />
                  مسح ضوئي
                </button>
                <span className="text-gray-400">أو</span>
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  اسحب الملفات هنا أو انقر للاختيار
                </p>
                <p className="text-sm text-gray-500">
                  يدعم PDF, DOC, DOCX, JPG, PNG (حد أقصى 10 ميجابايت لكل ملف)
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">الملفات المحددة:</h3>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileIcon className="w-5 h-5 text-blue-600 ml-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 space-x-reverse">
          <button
            type="button"
            onClick={() => navigate('/mails')}
            className="btn btn-secondary"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                رفع المراسلة
              </>
            )}
          </button>
        </div>
      </form>

      {/* Document Scanner Modal */}
      {showScanner && (
        <DocumentScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default UploadMailPage;