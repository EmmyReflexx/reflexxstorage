import { useToast, ToastContainer } from '../../Reflexx_Tools/react-toast';
import { vaultCheckStore } from '../../store/vaultCheckState';
import { useReflexxValue } from '../../Reflexx_Tools/reflexx-state';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/headers/Header';
import { VaultSignUp } from './VaultSignUp';
import { VaultLogin } from './VaultLogin';

export function Vault() {
  const { toasts, removeToast, success, info, error } = useToast();
  const [account, setAccount] = useReflexxValue(vaultCheckStore, 'account');

  // Shows a success toast when signup completes, then reminds user to log in
  function showSignUpToast() {
    success('Account created successfully!', {
      duration: 2000,
    });
    info('Login to your account', {
      duration: 5000,
    });
  }

  // Shows either a success or error toast depending on login result
  function showLoginToast(state) {
    if (state === 'success') {
      success('Login successful!', {
        duration: 2500,
      });
    } else {
      error('Password Incorrect', {
        duration: 2500,
      });
    }
  }

  return (
    <>

      <Helmet>
        <title>Reflexx | Secure Vault</title>
        <meta name="description" content="Access your encrypted vault with password protection" />
      </Helmet>

      <Header />
      {/* Shows signup form if no account exists, otherwise shows login form */}
      {account ? (
        <VaultLogin showToast={showLoginToast} />
      ) : (
        <VaultSignUp showToast={showSignUpToast} />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
