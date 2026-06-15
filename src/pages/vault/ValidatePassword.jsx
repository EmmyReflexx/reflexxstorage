// ValidatePassword.jsx
import { Dot } from 'lucide-react';
import { checkPassword } from '../../utils/passwordValidation';

export function ValidatePassword({ password, passwordState }) {
  // Runs all the password strength checks and returns boolean results for each rule
  const result = checkPassword(password);

  return (
    <div>
      <p
        className={`password-instructions ${result?.eight && passwordState ? 'password-pass' : 'password-error'}`}
      >
        <Dot />
        Password must be at least 8 characters
      </p>
      <p
        className={`password-instructions ${result?.uppercase && passwordState ? 'password-pass' : 'password-error'}`}
      >
        <Dot />
        Password must contain at least one uppercase letter
      </p>
      <p
        className={`password-instructions ${result?.number && passwordState ? 'password-pass' : 'password-error'}`}
      >
        <Dot />
        Password must contain at least one number
      </p>
      <p
        className={`password-instructions ${result?.special && passwordState ? 'password-pass' : 'password-error'}`}
      >
        <Dot />
        Password must contain at least one special character
      </p>
    </div>
  );
}
