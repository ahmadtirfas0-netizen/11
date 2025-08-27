import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin';
import { mailService } from '../services/mail';
import ReportGenerator from '../components/Reports/ReportGenerator';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { Mail, Department } from '../types';

const ReportsPage: React.FC = () => {
  const [mails, setMails] = useState<Mail[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mailsResponse, departmentsResponse] = await Promise.all([
        mailService.getAllMails(1, 1000), // Get all mails for reports
        adminService.getAllDepartments()
      ]);
      
      setMails(mailsResponse.data);
      setDepartments(departmentsResponse);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
        <p className="text-gray-600 mt-2">إنشاء وتصدير التقارير المختلفة</p>
      </div>
      
      <ReportGenerator mails={mails} departments={departments} />
    </div>
  );
};

export default ReportsPage;