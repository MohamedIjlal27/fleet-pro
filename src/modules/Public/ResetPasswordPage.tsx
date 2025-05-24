import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Checkbox from '@/components/form/input/Checkbox';
import Button from '@/components/ui/button/Button';
import { reSetPassword } from './apis/apis'; // Ensure this path is correct
import { toast } from 'react-toastify'; // Import toast library
import logo from "/src/assets/logo.svg";
import logoDark from '/src/assets/logo-dark.svg';
import { CheckCircle, XCircle } from 'lucide-react';
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token'); // Assume the token is passed in the URL as `token`

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

  const handleSubmit = async () => {
    if (isResetSuccessful) {
      toast.info('Password has already been reset.');
      return; // Prevent further submission if the password is already reset
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
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await reSetPassword(token, newPassword, confirmPassword);
      if (response?.data && response.status <= 300) {
        setIsResetSuccessful(true);
        toast.success(`Password reset successfully!`);
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
        title="Reset Password | Synops AI"
        description="This is Reset Password page for Synops AI"
      />
      <div className="relative p-6 bg-white dark:bg-gray-900 sm:p-0">
        <div className="flex flex-col justify-center w-full h-screen lg:flex-row">
          <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
              <div className="mb-5 sm:mb-8">
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
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                  Reset Your Password
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter and confirm your new password below.
                </p>
              </div>

              <div className="space-y-6">
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
                      <Label>
                        New Password <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => handleNewPasswordChange(e.target.value)}
                        placeholder="Enter your new password"
                        disabled={isResetSuccessful}
                      />
                      <div className="space-y-1 mt-2">
                        <Rule isValid={passwordRules.length} label="At least 8 characters" />
                        <Rule
                          isValid={passwordRules.uppercase}
                          label="At least one uppercase letter"
                        />
                        <Rule
                          isValid={passwordRules.lowercase}
                          label="At least one lowercase letter"
                        />
                        <Rule isValid={passwordRules.number} label="At least one number" />
                        <Rule
                          isValid={passwordRules.specialChar}
                          label="At least one special character"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>
                        Confirm Password <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        disabled={isResetSuccessful}
                      />
                      {confirmPassword && (
                        <div className="flex items-center text-sm gap-2 mt-1">
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

                    <div>
                      <Button
                        className="w-full"
                        size="sm"
                        disabled={loading || isResetSuccessful}
                        onClick={handleSubmit}
                      >
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </Button>
                    </div>

                    <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                      <Link
                        to="/login"
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Back to Login
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
