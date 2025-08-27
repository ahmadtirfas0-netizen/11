import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Eye, CheckCircle, FileText as FileIcon, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { referralService } from '../services/referrals';
import StatusBadge from '../components/Common/StatusBadge';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { Referral, Comment } from '../types';

const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      if (user?.sectionId) {
        const response = await referralService.getReferralsBySection(user.sectionId);
        setReferrals(response.data);
      }
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralClick = async (referral: Referral) => {
    setSelectedReferral(referral);
    
    try {
      const commentsData = await referralService.getCommentsByReferral(referral.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
    
    // Update status to viewed if it was pending
    if (referral.status === 'Pending') {
      try {
        await referralService.updateReferralStatus(referral.id, 'Viewed');
        setReferrals(prev => prev.map(r => 
          r.id === referral.id ? { ...r, status: 'Viewed' as const } : r
        ));
      } catch (error) {
        console.error('Error updating referral status:', error);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedReferral) return;

    setIsSubmittingComment(true);
    try {

      const comment = await referralService.addComment(selectedReferral.id, newComment);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const markAsCompleted = async (referralId: string) => {
    try {
      await referralService.updateReferralStatus(referralId, 'Completed');
      setReferrals(prev => prev.map(r => 
        r.id === referralId ? { ...r, status: 'Completed' as const } : r
      ));
      
      if (selectedReferral?.id === referralId) {
        setSelectedReferral(prev => prev ? { ...prev, status: 'Completed' as const } : null);
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full" dir="rtl">
      {/* Referrals List */}
      <div className="lg:col-span-1">
        <div className="card h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 ml-3 text-blue-600" />
              الإحالات المطلوبة
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {referrals.length}
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                onClick={() => handleReferralClick(referral)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedReferral?.id === referral.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={referral.status} />
                  <span className="text-xs text-gray-500">
                    {formatDate(referral.createdAt)}
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">
                  إحالة رقم #{referral.id}
                </h3>
                
                <p className="text-sm text-gray-600">
                  {referral.section?.name}
                </p>
                
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3 ml-1" />
                  <span>منذ {Math.floor((Date.now() - new Date(referral.createdAt).getTime()) / (1000 * 60 * 60 * 24))} أيام</span>
                </div>
              </div>
            ))}

            {referrals.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد إحالات مطلوبة</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Details */}
      <div className="lg:col-span-2">
        {selectedReferral ? (
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                تفاصيل الإحالة #{selectedReferral.id}
              </h2>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedReferral.status} />
                {selectedReferral.status !== 'Completed' && (
                  <button
                    onClick={() => markAsCompleted(selectedReferral.id)}
                    className="btn btn-success btn-sm flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    تم الإنجاز
                  </button>
                )}
              </div>
            </div>

            {/* Mail Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileIcon className="w-5 h-5 ml-2 text-blue-600" />
                معلومات المراسلة
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">الرقم الإشاري:</span>
                  <span className="font-medium text-gray-900 mr-2">2024/001</span>
                </div>
                <div>
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-medium text-gray-900 mr-2">2024/01/15</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">الموضوع:</span>
                  <span className="font-medium text-gray-900 mr-2">طلب تحديث أنظمة الحاسوب</span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-4">التعليقات والملاحظات</h3>
              
              <div className="flex-1 space-y-4 mb-4 max-h-64 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{comment.user?.fullName}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>لا توجد تعليقات بعد</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="border-t border-gray-200 pt-4">
                <div className="flex space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.fullName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="أضف تعليقاً أو ملاحظة..."
                      rows={3}
                      className="input resize-none"
                      disabled={selectedReferral.status === 'Completed'}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment || selectedReferral.status === 'Completed'}
                        className="btn btn-primary btn-sm flex items-center gap-1"
                      >
                        {isSubmittingComment ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                        إضافة تعليق
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="card h-full flex items-center justify-center">
            <div className="text-center">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">اختر إحالة لعرض التفاصيل</h3>
              <p className="text-gray-500">انقر على إحدى الإحالات من القائمة لعرض التفاصيل والتعليقات</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsPage;