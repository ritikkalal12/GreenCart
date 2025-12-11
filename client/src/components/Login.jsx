import React from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { setShowUserLogin, setUser, axios, navigate } = useAppContext();

  const [state, setState] = React.useState('login'); // 'login' | 'register'
  const [registerStep, setRegisterStep] = React.useState('form'); // 'form' | 'otp'

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // ---------- NORMAL LOGIN / REGISTER (WITH OTP) ----------
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'login') {
        // ---------- LOGIN FLOW ----------
        const { data } = await axios.post(`/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          navigate('/');
          setUser(data.user);
          setShowUserLogin(false);
        } else {
          toast.error(data.message);
        }
      } else {
        // ---------- REGISTER FLOW WITH OTP ----------
        if (registerStep === 'form') {
          // Step 1: validate passwords then send OTP
          if (!name || !email || !password || !confirmPassword) {
            return toast.error('Please fill all fields');
          }

          if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
          }

          const { data } = await axios.post(`/api/user/register/send-otp`, {
            email,
          });

          if (data.success) {
            toast.success(data.message || 'OTP sent to your email');
            setRegisterStep('otp');
          } else {
            toast.error(data.message || 'Failed to send OTP');
          }
        } else if (registerStep === 'otp') {
          // Step 2: verify OTP + register
          if (!otp) {
            return toast.error('Please enter OTP');
          }

          const { data } = await axios.post(`/api/user/register`, {
            name,
            email,
            password,
            otp,
          });

          if (data.success) {
            toast.success('Registration successful');
            navigate('/');
            setUser(data.user);
            setShowUserLogin(false);
          } else {
            toast.error(data.message || 'Failed to register');
          }
        }
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  // ---------- GOOGLE LOGIN / SIGNUP ----------
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        return toast.error('Google credential missing');
      }

      const { data } = await axios.post('/api/user/google-auth', {
        credential,
      });

      if (data.success) {
        toast.success('Logged in with Google');
        navigate('/');
        setUser(data.user);
        setShowUserLogin(false);
      } else {
        toast.error(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Google login failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed');
  };

  const switchToRegister = () => {
    setState('register');
    setRegisterStep('form');
    setOtp('');
  };

  const switchToLogin = () => {
    setState('login');
    setRegisterStep('form');
    setOtp('');
  };

  const closeModal = () => {
    setShowUserLogin(false);
    // optional: reset fields
    setState('login');
    setRegisterStep('form');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
  };

  return (
    <div
      onClick={closeModal}
      className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className='flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border border-gray-200 bg-white'
      >
        <p className='text-2xl font-medium m-auto'>
          <span className='text-primary'>User</span>{' '}
          {state === 'login' ? 'Login' : 'Sign Up'}
        </p>

        {/* NAME (only on register) */}
        {state === 'register' && (
          <div className='w-full'>
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder='type here'
              className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary'
              type='text'
              required
              disabled={registerStep === 'otp'}
            />
          </div>
        )}

        {/* EMAIL */}
        <div className='w-full '>
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder='type here'
            className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary'
            type='email'
            required
            disabled={state === 'register' && registerStep === 'otp'}
          />
        </div>

        {/* PASSWORD */}
        <div className='w-full '>
          <p>Password</p>
          <div className='relative'>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder='type here'
              className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary pr-10'
              type={showPassword ? 'text' : 'password'}
              required
              disabled={state === 'register' && registerStep === 'otp'}
            />
            <span
              onClick={() => setShowPassword((p) => !p)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary cursor-pointer select-none'
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>

        {/* CONFIRM PASSWORD (only on register, form step) */}
        {state === 'register' && registerStep === 'form' && (
          <div className='w-full '>
            <p>Confirm Password</p>
            <div className='relative'>
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                placeholder='type here'
                className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary pr-10'
                type={showConfirmPassword ? 'text' : 'password'}
                required
              />
              <span
                onClick={() => setShowConfirmPassword((p) => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary cursor-pointer select-none'
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>
        )}

        {/* OTP FIELD (register, otp step) */}
        {state === 'register' && registerStep === 'otp' && (
          <div className='w-full '>
            <p>OTP (sent to your email)</p>
            <input
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              placeholder='Enter 6-digit OTP'
              className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary'
              type='text'
              maxLength={6}
              required
            />
          </div>
        )}

        {/* SWITCH LOGIN / REGISTER */}
        {state === 'register' ? (
          <p>
            Already have account?{' '}
            <span
              onClick={switchToLogin}
              className='text-primary cursor-pointer'
            >
              click here
            </span>
          </p>
        ) : (
          <p>
            Create an account?{' '}
            <span
              onClick={switchToRegister}
              className='text-primary cursor-pointer'
            >
              click here
            </span>
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button className='bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer'>
          {state === 'login'
            ? 'Login'
            : registerStep === 'form'
            ? 'Send OTP'
            : 'Verify & Register'}
        </button>

        {/* DIVIDER */}
        <div className='flex items-center w-full gap-2 my-2'>
          <span className='h-px flex-1 bg-gray-200' />
          <span className='text-xs text-gray-400'>OR</span>
          <span className='h-px flex-1 bg-gray-200' />
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        <div className='w-full flex justify-center'>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape='rectangular'
            text='continue_with'
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
