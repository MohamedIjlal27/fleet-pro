import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import PageMeta from '@/components/common/PageMeta';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '@/icons';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Checkbox from '@/components/form/input/Checkbox';
import Button from '@/components/ui/button/Button';
import logo from "/src/assets/logo.svg";
import logoDark from '/src/assets/logo-dark.svg';
import axiosInstance from '../../../utils/axiosConfig';
import { useAppDispatch } from '../../../redux/app/store';
import { setUser } from '../../../redux/features/user';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';

interface FormData {
  email: string;
}

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<FormData>({
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime > 0) {
      timer = setTimeout(() => setCooldownTime((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: id === 'email' ? value.trim().toLowerCase() : value.trim(),
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.email) {
      return;
    }

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/api/auth/forget-password', formData);
      toast.success('Reset link sent! Please check your email.');
      setCooldownTime(30);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid email address or request failed. Please try again.';

      toast.error(message);
      console.log('Forgot Password error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Forgot Password | Synops AI"
        description="This is Forgot Password page for Synops AI"
      />
      <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
        <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
          <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
              <div>
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
                  <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                    Forgot Your Password?
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the email address linked to your account, and we’ll send you a link to
                    reset your password.
                  </p>
                </div>
                <div>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <Label>
                          Email <span className="text-error-500">*</span>{' '}
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          placeholder="Enter your account email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Button
                          className={`w-full ${
                            loading || cooldownTime > 0 ? 'cursor-not-allowed opacity-60' : ''
                          }`}
                          size="sm"
                          disabled={loading || cooldownTime > 0}
                        >
                          {loading
                            ? 'Sending...'
                            : cooldownTime > 0
                            ? `Try again in ${cooldownTime}s`
                            : 'Send Reset Link'}
                        </Button>
                      </div>
                    </div>
                  </form>

                  <div className="mt-5">
                    <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                      <Link
                        to="/login"
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Back to Login
                      </Link>
                    </p>
                  </div>
                </div>
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

export default ForgotPassword;
