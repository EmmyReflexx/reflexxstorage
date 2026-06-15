import { useNavigate } from 'react-router-dom';
import { userDetails, decryptPassword } from '../../store/userDetails';
import { useReflexxValue } from '../../Reflexx_Tools/reflexx-state';
import { checkPassword } from '../../utils/passwordValidation';
import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/headers/Header';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ValidatePassword } from './ValidatePassword';
import { InputText } from 'primereact/inputtext';
import { Eye, EyeOff } from 'lucide-react';

export function VaultLogin({ showToast }) {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordState, setPasswordState] = useState(false);
  const mainContainerRef = useRef(null);
  const timerRef = useRef(null);
  const navigateTimeoutRef = useRef(null);

  // Gets the stored user's password from global state
  const [user, setUser] = useReflexxValue(userDetails, 'userDetails');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Checks password strength in real time as the user types
  const passwordValidation = checkPassword(password);
  const navigate = useNavigate();

  // Simulates decryption delay before verifying the password and redirecting
  const startTimer = (e) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);

    setIsLoading(true);

    timerRef.current = setTimeout(() => {
      setPasswordState(false);
      // to decrypt the stored password and compare it with the entered password
      const decryptedUser = decryptPassword(user);
      if (password === decryptedUser) {
        showToast('success');

        navigateTimeoutRef.current = setTimeout(() => {
          navigate('/vault-explorer', { replace: true });
        }, 2000);
      } else {
        showToast('error');
      }
      setIsLoading(false);
      e.target.reset();
    }, 5000);
  };

  // Cleans up timeouts when the component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(navigateTimeoutRef.current);
    };
  }, []);

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    setPasswordState(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    startTimer(e);
  }

  return (
    <>
      <Helmet>
        <title>Reflexx | Vault Login</title>
        <meta name="description" content="Enter your password to access your secure vault" />
      </Helmet>
      <Header />
      <div
        ref={mainContainerRef}
        className="relative flex min-h-[calc(100vh-80px)] items-center justify-center p-6"
      >
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-neon-edge bg-bg-surface p-8 shadow-lg backdrop-blur-sm transition-all duration-300">
            <h1 className="mb-8 text-center font-lexend-b text-[24px] font-bold leading-tight text-text-main md:text-[28px]">
              Enter Your Vault
            </h1>
            <p className="mb-8 text-center font-lexend-r text-sm text-text-muted">
              Enter your password to access your vault
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block font-lexend-r text-sm font-medium text-text-muted"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <InputText
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-neon-edge bg-bg-canvas px-4 py-3 font-lexend-r text-text-main placeholder:text-text-muted/60 focus:border-brand-neon focus:outline-none focus:ring-1 focus:ring-brand-neon focus:ring-offset-0 transition-colors duration-200"
                    autoComplete="current-password"
                    onChange={handlePasswordChange}
                  />

                  <span
                    type="button"
                    className="absolute right-3 text-text-muted/80 hover:text-brand-neon transition-colors duration-200 focus:outline-none cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>

                <ValidatePassword
                  password={password}
                  passwordState={passwordState}
                />
              </div>

              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-brand-neon to-brand-glow py-3 font-lexend-b font-semibold text-bg-canvas cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-neon focus:ring-offset-2 focus:ring-offset-bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !passwordValidation.eight ||
                    !passwordValidation.uppercase ||
                    !passwordValidation.number ||
                    !passwordValidation.special
                  }
                >
                  Access Vault
                </button>

                <p className="text-center font-lexend-r text-xs text-text-muted">
                  This is a secure vault. Your password is encrypted.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Full-screen spinner that shows while we simulate decryption */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              borderRadius: '8px',
            }}
          >
            <ProgressSpinner fill="var(--color-bg-canvas)" />
          </div>
        )}
      </div>
    </>
  );
}
