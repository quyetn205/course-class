import { useMyClasses } from '../../hooks/useStudentHooks';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { GraduationCap, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyClasses = () => {
  const { data: classes, isLoading } = useMyClasses();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;

  const enrolledClasses = classes ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lớp học của tôi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách các lớp bạn đã ghi danh</p>
      </div>

      {enrolledClasses.length === 0 ? (
        <EmptyState
          title="Chưa ghi danh lớp nào"
          description="Bạn chưa được thêm vào lớp học nào. Vui lòng liên hệ giảng viên."
          icon={<GraduationCap className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledClasses.map((cls) => (
            <Card key={cls.id} onClick={() => navigate(`/student/classes/${cls.id}/progress`)}>
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{cls.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cls.courseName}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {cls.currentStudents}/{cls.maxStudents}
                      </span>
                      {cls.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(cls.startDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <Badge variant={cls.status === 'OPEN' ? 'success' : cls.status === 'IN_PROGRESS' ? 'primary' : 'default'}>
                        {cls.status === 'OPEN' ? 'Mở' : cls.status === 'IN_PROGRESS' ? 'Đang học' : 'Đã đóng'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
