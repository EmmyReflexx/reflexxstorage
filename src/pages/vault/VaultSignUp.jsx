import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useReflexxValue } from '../../Reflexx_Tools/reflexx-state';
import { userDetails, encryptPassword } from '../../store/userDetails';
import { checkPassword } from '../../utils/passwordValidation';
import { vaultCheckStore } from '../../store/vaultCheckState';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/headers/Header';
import { Eye, EyeOff } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ValidatePassword } from './ValidatePassword';

export function VaultSignUp({ showToast }) {
  const [isLoading, setIsLoading] = useState(false);
  const mainContainerRef = useRef(null);
  const timerRef = useRef(null);
  const navigateTimeoutRef = useRef(null);

  const navigate = useNavigate();

  // Reactive state mappings for the signup form fields
  const [details, setDetails] = useReflexxValue(userDetails, 'userDetails');
  const [account, setAccount] = useReflexxValue(vaultCheckStore, 'account');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValidation = checkPassword(password);

  // Simulates account creation with a loading delay before showing success and redirecting
  const startTimer = (e) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);

    setIsLoading(true);

    timerRef.current = setTimeout(() => {
      showToast();

      navigateTimeoutRef.current = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);

      setIsLoading(false);

      // Marks that a vault account now exists
      setAccount(true);
      e.target.reset();
    }, 5000);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(navigateTimeoutRef.current);
    };
  }, []);

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // to encrypt the password before storing it in the global state
    const encryptedPassword = encryptPassword(password);
    setDetails(encryptedPassword);
    startTimer(e);
  }

  return (
    <>
      <Helmet>
        <title>Reflexx | Create Vault Account</title>
        <meta name="description" content="Create a secure vault with password protection" />
      </Helmet>

      <Header />
      <div
        ref={mainContainerRef}
        className="relative flex min-h-[calc(100vh-80px)] items-center justify-center p-6"
      >
        <div className="w-full max-w-md rounded-2xl border border-neon-edge bg-bg-surface p-8 shadow-lg backdrop-blur-sm transition-all duration-300">
          <h1 className="mb-8 text-center font-lexend-b text-[20px] font-bold leading-tight text-text-main md:text-[24px]">
            Set A Password to use in <br />
            Accessing Your Vault Anytime
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block font-lexend-r text-sm font-medium text-text-muted"
              >
                Create Password
              </label>
              <div className="relative flex items-center">
                <InputText
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your vault password"
                  className="w-full rounded-lg border border-neon-edge bg-bg-canvas pl-4 pr-11 py-3 font-lexend-r text-text-main placeholder:text-text-muted/60 focus:border-brand-neon focus:outline-none focus:ring-1 focus:ring-brand-neon focus:ring-offset-0 transition-colors duration-200"
                  autoComplete="new-password"
                  tooltip="Password must contain: 8+ characters, 1 uppercase letter, 1 number, 1 special character"
                  tooltipOptions={{ position: 'bottom' }}
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
            </div>

            <ValidatePassword password={password} />

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block font-lexend-r text-sm font-medium text-text-muted"
              >
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <InputText
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your vault password"
                  className="w-full rounded-lg border border-neon-edge bg-bg-canvas pl-4 pr-11 py-3 font-lexend-r text-text-main placeholder:text-text-muted/60 focus:border-brand-neon focus:outline-none focus:ring-1 focus:ring-brand-neon focus:ring-offset-0 transition-colors duration-200"
                  autoComplete="new-password"
                  onChange={handleConfirmPasswordChange}
                />
                <span
                  type="button"
                  className="absolute right-3 text-text-muted/80 hover:text-brand-neon transition-colors duration-200 focus:outline-none cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-brand-neon to-brand-glow py-3 font-lexend-b font-semibold text-bg-canvas cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-neon focus:ring-offset-2 focus:ring-offset-bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !passwordValidation.eight ||
                  !passwordValidation.uppercase ||
                  !passwordValidation.number ||
                  !passwordValidation.special ||
                  !confirmPassword ||
                  password !== confirmPassword
                }
              >
                Create & Secure Vault
              </button>

              <p className="text-center font-lexend-r text-xs text-text-muted">
                This password cannot be recovered. Make sure to save it
                securely.
              </p>
            </div>
          </form>
        </div>

        {/* Full-screen spinner that shows while we simulate account creation */}
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
