import React, { useState } from 'react';
import { FileText as FileIcon, Download, Calendar, Filter, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Mail, Department } from '../../types';

interface ReportGeneratorProps {
  mails: Mail[];
  departments: Department[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ mails, departments }) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'statistics'>('summary');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add Arabic font support (you would need to include Arabic font)
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      
      // Header
      pdf.text('تقرير نظام الأرشفة الإلكتروني', 105, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`, 20, 35);
      
      let yPosition = 50;
      
      // Filter information
      if (dateRange.from || dateRange.to || selectedDepartment) {
        pdf.text('معايير التصفية:', 20, yPosition);
        yPosition += 10;
        
        if (dateRange.from) {
          pdf.text(`من تاريخ: ${dateRange.from}`, 30, yPosition);
          yPosition += 7;
        }
        if (dateRange.to) {
          pdf.text(`إلى تاريخ: ${dateRange.to}`, 30, yPosition);
          yPosition += 7;
        }
        if (selectedDepartment) {
          const dept = departments.find(d => d.id === selectedDepartment);
          pdf.text(`الإدارة: ${dept?.name || ''}`, 30, yPosition);
          yPosition += 7;
        }
        yPosition += 10;
      }

      // Statistics
      const filteredMails = filterMails();
      const incomingCount = filteredMails.filter(m => m.direction === 'incoming').length;
      const outgoingCount = filteredMails.filter(m => m.direction === 'outgoing').length;
      
      pdf.text('إحصائيات المراسلات:', 20, yPosition);
      yPosition += 10;
      pdf.text(`إجمالي المراسلات: ${filteredMails.length}`, 30, yPosition);
      yPosition += 7;
      pdf.text(`المراسلات الواردة: ${incomingCount}`, 30, yPosition);
      yPosition += 7;
      pdf.text(`المراسلات الصادرة: ${outgoingCount}`, 30, yPosition);
      yPosition += 15;

      // Mail details (if detailed report)
      if (reportType === 'detailed' && filteredMails.length > 0) {
        pdf.text('تفاصيل المراسلات:', 20, yPosition);
        yPosition += 10;
        
        filteredMails.slice(0, 20).forEach((mail, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.text(`${index + 1}. ${mail.referenceNumber} - ${mail.subject.substring(0, 50)}...`, 30, yPosition);
          yPosition += 7;
          pdf.text(`   التاريخ: ${mail.mailDate} | النوع: ${mail.direction === 'incoming' ? 'وارد' : 'صادر'}`, 35, yPosition);
          yPosition += 10;
        });
      }

      pdf.save(`تقرير-المراسلات-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    const filteredMails = filterMails();
    const csvContent = [
      ['الرقم الإشاري', 'الموضوع', 'التاريخ', 'النوع', 'الإدارة'].join(','),
      ...filteredMails.map(mail => [
        mail.referenceNumber,
        `"${mail.subject}"`,
        mail.mailDate,
        mail.direction === 'incoming' ? 'وارد' : 'صادر',
        mail.direction === 'incoming' ? mail.fromDepartment?.name : mail.toDepartment?.name
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `مراسلات-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const filteredMails = filterMails();
    const incomingCount = filteredMails.filter(m => m.direction === 'incoming').length;
    const outgoingCount = filteredMails.filter(m => m.direction === 'outgoing').length;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>تقرير المراسلات</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { margin: 20px 0; }
          .mail-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير نظام الأرشفة الإلكتروني</h1>
          <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        
        <div class="stats">
          <h2>إحصائيات المراسلات</h2>
          <p>إجمالي المراسلات: ${filteredMails.length}</p>
          <p>المراسلات الواردة: ${incomingCount}</p>
          <p>المراسلات الصادرة: ${outgoingCount}</p>
        </div>
        
        ${reportType === 'detailed' ? `
          <div class="details">
            <h2>تفاصيل المراسلات</h2>
            ${filteredMails.map(mail => `
              <div class="mail-item">
                <strong>${mail.referenceNumber}</strong> - ${mail.subject}<br>
                التاريخ: ${mail.mailDate} | النوع: ${mail.direction === 'incoming' ? 'وارد' : 'صادر'}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const filterMails = () => {
    return mails.filter(mail => {
      if (dateRange.from && mail.mailDate < dateRange.from) return false;
      if (dateRange.to && mail.mailDate > dateRange.to) return false;
      if (selectedDepartment) {
        const matchesDept = mail.fromDepartment?.id === selectedDepartment || 
                           mail.toDepartment?.id === selectedDepartment;
        if (!matchesDept) return false;
      }
      return true;
    });
  };

  return (
    <div className="card" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <FileIcon className="w-6 h-6 ml-3 text-blue-600" />
          مولد التقارير
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع التقرير
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="select"
          >
            <option value="summary">تقرير موجز</option>
            <option value="detailed">تقرير مفصل</option>
            <option value="statistics">تقرير إحصائي</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline ml-2" />
            من تاريخ
          </label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
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
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4 inline ml-2" />
            الإدارة
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
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
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'جاري الإنشاء...' : 'تحميل PDF'}
        </button>

        <button
          onClick={exportToCSV}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          تصدير CSV
        </button>

        <button
          onClick={printReport}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          طباعة
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">معاينة التقرير</h3>
        <div className="text-sm text-gray-600">
          <p>عدد المراسلات المفلترة: {filterMails().length}</p>
          <p>الواردة: {filterMails().filter(m => m.direction === 'incoming').length}</p>
          <p>الصادرة: {filterMails().filter(m => m.direction === 'outgoing').length}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;