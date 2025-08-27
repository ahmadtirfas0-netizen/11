import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../services/admin';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { User, Department, Section } from '../types';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'head' as 'admin' | 'manager' | 'head',
    departmentId: '',
    sectionId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, departmentsData, sectionsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllDepartments(),
        adminService.getAllSections()
      ]);
      
      setUsers(usersData);
      setDepartments(departmentsData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updatedUser = await adminService.updateUser(editingUser.id, formData);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      } else {
        const newUser = await adminService.createUser(formData);
        setUsers(prev => [...prev, newUser]);
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId || '',
      sectionId: user.sectionId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await adminService.deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const openModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      role: 'head',
      departmentId: '',
      sectionId: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setShowPassword(false);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام';
      case 'manager': return 'مدير إدارة';
      case 'head': return 'رئيس قسم';
      default: return role;
    }
  };

  const filteredSections = sections.filter(s => s.departmentId === formData.departmentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-600 mt-2">إضافة وتعديل وحذف المستخدمين</p>
        </div>
        <button
          onClick={openModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          مستخدم جديد
        </button>
      </div>

      {/* Users Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-6 h-6 ml-3 text-blue-600" />
            قائمة المستخدمين ({users.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">اسم المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الاسم الكامل</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الدور</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الإدارة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">القسم</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.department?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.section?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="input"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور {editingUser ? '' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingUser}
                    className="input pl-10"
                    placeholder={editingUser ? 'اتركها فارغة للاحتفاظ بالحالية' : 'أدخل كلمة المرور'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="input"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  required
                  className="select"
                >
                  <option value="head">رئيس قسم</option>
                  <option value="manager">مدير إدارة</option>
                  <option value="admin">مدير النظام</option>
                </select>
              </div>

              {formData.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الإدارة *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value, sectionId: '' }))}
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
              )}

              {formData.role === 'head' && formData.departmentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القسم *
                  </label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                    required
                    className="select"
                  >
                    <option value="">اختر القسم</option>
                    {filteredSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingUser ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;