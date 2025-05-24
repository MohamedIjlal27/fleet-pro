import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import PageMeta from "@/components/common/PageMeta";
import logo from '../../../assets/logo.svg';
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axiosInstance from '../../../utils/axiosConfig';
import { useAppDispatch } from '../../../redux/app/store';
import { setUser } from '../../../redux/features/user';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/user');
        const user = res.data;
        const resSystemPlans = await axiosInstance.get('/api/system-plans');
        const systemPlans = resSystemPlans.data;

        if (res.data) {
          dispatch(
            setUser({
              id: user.id,
              email: user.email,
              username: user.username,
              picture: user.picture,
              organizationId: user.organizationId,
              firstName: user.firstName,
              lastName: user.lastName,
              roles: user.roleList,
              permissions: user.permissionList,
              subscribedPlans: systemPlans.subscribedPlans,
              modules: systemPlans.modules,
            })
          );
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    fetchUserDetails();
  }, [dispatch, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: id === 'email' ? value.trim().toLowerCase() : value.trim(),
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.post('/api/auth/login', formData);
      const { user } = res.data;
      const resSystemPlans = await axiosInstance.get('/api/system-plans');
      const systemPlans = resSystemPlans.data;

      dispatch(
        setUser({
          id: user.id,
          email: user.email,
          username: user.username,
          picture: user.picture,
          organizationId: user.organizationId,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roleList,
          permissions: user.permissionList,
          subscribedPlans: systemPlans.subscribedPlans,
          modules: systemPlans.modules,
        })
      );

      navigate('/dashboard');
      console.log('Signed in successfully');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Sign In error. Please try again.'
      );
      console.log('Sign In error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      window.location.href = `${
        import.meta.env.VITE_BACKEND_BASE_URL
      }/api/auth/google/login`;
      console.log('Redirecting to Google for OAuth...');
    } catch (error: any) {
      console.log('Google Login error', error);
    }
  };

  return (
    <>
      <PageMeta
        title="Login | Synops AI"
        description="This is Login page for Synops AI"
      />
    <div className="flex flex-col justify-center items-center bg-gradient-to-r from-slate-100 to-slate-300 h-screen w-screen">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-slate-900 p-6 text-center">
          <img src={logo} alt="logo" className="h-8 mx-auto" />
        </div>
        <div className="p-8 mt-4">
          {/* Continue with Google button */}
          {/* <Button
            type="button"
            variant="outlined"
            fullWidth
            startIcon={<FcGoogle size={28} />}
            onClick={handleGoogleLogin}
            sx={{
              marginBottom: '1.5rem',
              borderColor: '#64748b', // slate-500
              color: '#64748b',
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.04)', // slate-500 background on hover
              },
              paddingTop: '12px',
              paddingBottom: '12px',
            }}
          >
            Continue with Google
          </Button>

          <div className="flex items-center mb-4 mt-4">
            <hr className="w-full border-slate-300" />
            <p className="mx-3 text-slate-500">OR</p>
            <hr className="w-full border-slate-300" />
          </div> */}

          {/* Form for login */}
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Hidden fields to trick the autofill */}
            <input
              type="text"
              name="hidden-username"
              style={{ display: 'none' }}
            />
            <input
              type="password"
              name="hidden-password"
              style={{ display: 'none' }}
            />

            <div className="mb-6">
              <TextField
                id="email"
                name="real-email"
                label="Email address"
                type="email"
                variant="outlined"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="off"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.1)',
                  },
                  '& .MuiInputLabel-root': { color: '#334155' }, // slate-700
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor: '#334155', // slate-700
                      textDecorationColor: '#334155',
                    },
                }}
              />
            </div>
            <div className="mb-6">
              <TextField
                id="password"
                name="real-password"
                label="Password"
                type={passwordVisible ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        edge="end"
                      >
                        {passwordVisible ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.1)',
                  },
                  '& .MuiInputLabel-root': { color: '#334155' }, // slate-700
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor: '#334155', // slate-700
                      textDecorationColor: '#334155',
                    },
                }}
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <Link
                to="/forgot-password"
                className="text-slate-700 underline hover:text-slate-900 transition-all duration-300"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#1e293b', // slate-800
                '&:hover': { backgroundColor: '#0f172a' }, // slate-900
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
        </div>
      </div>

      <footer className="mt-6 text-gray-600">
        <p className="text-sm">2024 © Synops AI</p>
      </footer>
    </div>
    </>
  );
};

export default Login;
