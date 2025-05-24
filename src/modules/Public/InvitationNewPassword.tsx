import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Checkbox from '@/components/form/input/Checkbox';
import Button from '@/components/ui/button/Button';
import { getUserInfoByToken, SetNewPassword } from './apis/apis';
import { toast } from 'react-toastify';
import logo from "/src/assets/logo.svg";
import logoDark from '/src/assets/logo-dark.svg';
import { CheckCircle, XCircle } from 'lucide-react';
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isResetSuccessful) {
      const timer = setTimeout(() => navigate('/login'), 5000);
      return () => clearTimeout(timer);
    }
  }, [isResetSuccessful]);

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

  useEffect(() => {
    if (token) {
      getUserInfoByToken(token)
        .then((response) => {
          if (response?.data) {
            setUser(response.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching user info:', error);
          toast.error('Failed to validate token. Please try again.');
        });
    }
  }, [token]);

  const handleSubmit = async () => {
    setErrorMessage(''); // Reset error messages before submission
    if (isResetSuccessful) {
      toast.info('Password has already been reset.');
      return;
    }

    if (!token) {
      toast.error('Invalid token. Please try again.');
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      toast.error(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await SetNewPassword(token, newPassword, confirmPassword);
      if (response?.data && response.status <= 300) {
        setIsResetSuccessful(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Invitation New Password | Synops AI"
        description="This is Invitation New Password page for Synops AI"
      />
      <div className="relative p-6 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col justify-center h-full max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <>
              <img
                className="w-auto h-10 mb-4 dark:hidden"
                src={logoDark}
                alt="Synops AI Logo"
                width={150}
                height={40}
              />
              <img
                className="w-auto h-10 mb-4 hidden dark:block"
                src={logo}
                alt="Synops AI Logo"
                width={150}
                height={40}
              />
            </>
          </div>

          {user && (
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 shadow-sm flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-lg font-semibold uppercase">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  {user?.role?.[0]?.name && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-400/20 dark:text-brand-300 rounded">
                      {user.role[0].name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mb-5">
            <h1 className="mb-2 font-semibold text-gray-800 dark:text-white text-title-md">
              Set Your New Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your password must contain at least 8 characters, one uppercase, one lowercase, one
              number, and one special character.
            </p>
          </div>

          <div className="space-y-5">
            {isResetSuccessful ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="w-10 h-10 mx-auto text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Password Reset Successful!
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can now log in with your new password.
                </p>
                <Link
                  to="/login"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded hover:bg-brand-600 transition"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    disabled={isResetSuccessful}
                  />
                  <div className="mt-2 space-y-1">
                    <Rule isValid={passwordRules.length} label="At least 8 characters" />
                    <Rule isValid={passwordRules.uppercase} label="At least one uppercase letter" />
                    <Rule isValid={passwordRules.lowercase} label="At least one lowercase letter" />
                    <Rule isValid={passwordRules.number} label="At least one number" />
                    <Rule
                      isValid={passwordRules.specialChar}
                      label="At least one special character"
                    />
                  </div>
                </div>

                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isResetSuccessful}
                  />
                  {confirmPassword && (
                    <div className="flex items-center mt-1 text-sm gap-2">
                      {confirmPassword === newPassword ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={
                          confirmPassword === newPassword ? 'text-green-600' : 'text-red-500'
                        }
                      >
                        {confirmPassword === newPassword
                          ? 'Passwords match'
                          : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>

                {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

                <Button
                  size="sm"
                  className={`w-full ${loading ? 'cursor-not-allowed opacity-60' : ''}`}
                  onClick={handleSubmit}
                  disabled={loading || isResetSuccessful}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
