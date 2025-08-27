import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin';
import { mailService } from '../services/mail';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { Mail, Department } from '../types';

const AnalyticsPage: React.FC = () => {
  const [mails, setMails] = useState<Mail[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mailsResponse, departmentsResponse] = await Promise.all([
        mailService.getAllMails(1, 1000), // Get all mails for analytics
        adminService.getAllDepartments()
      ]);
      
      setMails(mailsResponse.data);
      setDepartments(departmentsResponse);
    } catch (error) {
      console.error('Error loading analytics data:', error);
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
    <AnalyticsDashboard mails={mails} departments={departments} />
  );
};

export default AnalyticsPage;