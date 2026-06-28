import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, loginWithOtp } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  
  // Tab states: 'email' or 'phone'
  const [loginMethod, setLoginMethod] = useState('email');

  // Email form state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Clean up recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const onEmailSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (!result.error) navigate('/');
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });
    }
  };

  const onSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setSendingOtp(true);
    setOtpError(null);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+${phoneNumber.trim()}`;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setSendingOtp(false);
    } catch (err) {
      console.error(err);
      setOtpError(err.message || 'Failed to send OTP code. Ensure phone number starts with + and country code.');
      setSendingOtp(false);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || !confirmationResult) return;
    setSendingOtp(true);
    setOtpError(null);

    try {
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;
      
      // Call backend to authenticate/register user via phone number
      const response = await dispatch(loginWithOtp({ phoneNumber: user.phoneNumber }));
      setSendingOtp(false);
      if (!response.error) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setOtpError('Invalid OTP code. Please try again.');
      setSendingOtp(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <div className="glass rounded-3xl p-6">
        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Login to manage bookings and host spaces.</p>

        {/* Tab Selection */}
        <div className="mt-4 flex gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-xl py-2 text-center text-xs font-semibold transition ${
              loginMethod === 'email' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => {
              setLoginMethod('email');
              setOtpError(null);
            }}
          >
            Email Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-xl py-2 text-center text-xs font-semibold transition ${
              loginMethod === 'phone' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => {
              setLoginMethod('phone');
              setOtpError(null);
            }}
          >
            Phone Login (OTP)
          </button>
        </div>

        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {otpError && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{otpError}</p>}

        {loginMethod === 'email' ? (
          <form className="mt-4" onSubmit={onEmailSubmit}>
            <label className="block text-sm text-slate-600">Email or Username
              <input className="input mt-1" type="text" placeholder="name@workbnb.com or Shantanu Chorghe" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </label>
            <label className="mt-3 block text-sm text-slate-600 relative">Password
              <input className="input mt-1 pr-12" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </label>
            <button className="btn-primary mt-4 w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          </form>
        ) : (
          <div className="mt-4">
            <div id="recaptcha-container"></div>
            
            {!confirmationResult ? (
              <form onSubmit={onSendOtp}>
                <label className="block text-sm text-slate-600">Phone Number (with Country Code)
                  <input
                    className="input mt-1"
                    type="tel"
                    placeholder="+919876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="btn-primary mt-4 w-full"
                  disabled={sendingOtp || !phoneNumber.trim()}
                >
                  {sendingOtp ? 'Sending code...' : 'Send OTP Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={onVerifyOtp}>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 flex justify-between items-center">
                  <span>Code sent to <strong>{phoneNumber}</strong></span>
                  <button
                    type="button"
                    className="text-brand-500 font-bold hover:underline"
                    onClick={() => {
                      setConfirmationResult(null);
                      setOtpCode('');
                    }}
                  >
                    Change
                  </button>
                </div>

                <label className="block text-sm text-slate-600 mt-4">Verification Code (6 Digits)
                  <input
                    className="input mt-1 tracking-[0.5em] text-center font-bold text-lg"
                    type="text"
                    maxLength="6"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                  />
                </label>
                
                <button
                  type="submit"
                  className="btn-primary mt-4 w-full"
                  disabled={sendingOtp || otpCode.length !== 6}
                >
                  {sendingOtp ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
