import React, { useState } from 'react';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axiosConfig';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ChangePasswordCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const Rule = ({ isValid, label }: { isValid: boolean; label: string }) => (
    <div className="flex items-center text-sm gap-2">
      {isValid ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={isValid ? 'text-green-600' : 'text-red-500'}>{label}</span>
    </div>
  );

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordRules(validatePassword(value));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      toast.error(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await axiosInstance.post('/api/auth/reset-password', {
        oldPassword: currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Password changed successfully');
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update your password regularly to keep your account secure.
            </p>
          </div>
          <button
            onClick={openModal}
            className="mt-4 lg:mt-0 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Change Password
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
        <div className="p-6 dark:bg-gray-900 bg-white rounded-3xl">
          <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Change Password
          </h4>
          <form className="mt-6 space-y-5" onSubmit={handleSave}>
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
              />
              <div className="space-y-1 mt-2">
                <Rule isValid={passwordRules.length} label="At least 8 characters" />
                <Rule isValid={passwordRules.uppercase} label="At least one uppercase letter" />
                <Rule isValid={passwordRules.lowercase} label="At least one lowercase letter" />
                <Rule isValid={passwordRules.number} label="At least one number" />
                <Rule isValid={passwordRules.specialChar} label="At least one special character" />
              </div>
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && (
                <div className="flex items-center text-sm gap-2 mt-1">
                  {confirmPassword === newPassword ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={confirmPassword === newPassword ? 'text-green-600' : 'text-red-500'}
                  >
                    {confirmPassword === newPassword ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm">Save Changes</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
