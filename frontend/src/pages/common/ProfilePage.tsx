import { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile, useChangePassword } from '../../hooks/useUserHooks';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FileUpload } from '../../components/common/FileUpload';
import { API_BASE_URL } from '../../api/axiosClient';
import { User, Mail, Calendar, Shield, KeyRound, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { updateCurrentUser } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Profile form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setAvatar(profile.avatar || '');
    }
  }, [profile]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }

    updateProfileMutation.mutate(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar || undefined,
      },
      {
        onSuccess: (res) => {
          updateCurrentUser({
            name: res.data.data.name,
            avatar: res.data.data.avatar,
            phone: res.data.data.phone,
          });
        },
      }
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không trùng khớp');
      return;
    }
    if (oldPassword === newPassword) {
      toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }

    changePasswordMutation.mutate(
      {
        oldPassword,
        newPassword,
        confirmPassword,
      },
      {
        onSuccess: () => {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const roleLabel =
    profile?.role === 'ADMIN'
      ? 'Quản trị viên (Admin)'
      : profile?.role === 'INSTRUCTOR'
      ? 'Giảng viên (Instructor)'
      : 'Học viên (Student)';

  const roleVariant =
    profile?.role === 'ADMIN' ? 'danger' : profile?.role === 'INSTRUCTOR' ? 'primary' : 'success';

  const avatarUrl = avatar
    ? avatar.startsWith('http')
      ? avatar
      : `${API_BASE_URL}${avatar}`
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hồ sơ cá nhân & Bảo mật
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Quản lý thông tin tài khoản, cập nhật ảnh đại diện và thay đổi mật khẩu đăng nhập của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột 1: Thông tin cá nhân */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Thông tin tài khoản
                  </h3>
                  <p className="text-xs text-gray-500">Cập nhật họ tên, số điện thoại và ảnh đại diện</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Avatar section */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                  <div className="relative group shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-500/20 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-primary-500/20">
                        {name.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Ảnh đại diện
                    </h4>
                    <p className="text-xs text-gray-500 pb-2">
                      Định dạng JPG, PNG hoặc WEBP (tối đa 5MB)
                    </p>
                    <FileUpload
                      accept="image/*"
                      maxSizeMB={5}
                      folder="avatars"
                      onFileUploaded={(url) => setAvatar(url)}
                      currentFileUrl={avatar}
                      currentFileName="Ảnh đại diện"
                      onFileRemoved={() => setAvatar('')}
                    />
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <Input
                    label="Họ và tên"
                    placeholder="Nhập họ và tên đầy đủ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  {/* Email (Readonly) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Địa chỉ Email
                    </label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-gray-500 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{profile?.email}</span>
                      <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                        Cố định
                      </span>
                    </div>
                  </div>

                  <Input
                    label="Số điện thoại"
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  {/* Role & Date Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <span className="text-xs text-gray-500 block mb-1">Vai trò hệ thống:</span>
                      <Badge variant={roleVariant}>{roleLabel}</Badge>
                    </div>

                    <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <span className="text-xs text-gray-500 block mb-1">Ngày tham gia:</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : '---'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={updateProfileMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" /> Lưu thông tin cá nhân
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Cột 2: Đổi mật khẩu */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Đổi mật khẩu
                  </h3>
                  <p className="text-xs text-gray-500">Cập nhật mật khẩu mới để bảo vệ tài khoản</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="pt-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Mật khẩu cũ */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Mật khẩu hiện tại *
                  </label>
                  <div className="relative">
                    <Input
                      type={showOldPass ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu đang dùng"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Mật khẩu mới *
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Xác nhận mật khẩu mới *
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" /> Lưu ý bảo mật:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-gray-600 dark:text-gray-400">
                    <li>Mật khẩu nên chứa cả chữ, số và ký tự đặc biệt.</li>
                    <li>Không sử dụng lại mật khẩu cũ hoặc thông tin dễ đoán.</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    variant="primary"
                    isLoading={changePasswordMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Cập nhật mật khẩu
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
