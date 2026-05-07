import { Input } from '../ui/Input';

interface PasswordChangeFieldsProps {
  newPassword: string;
  confirmPassword: string;
  onNewPasswordChange: (val: string) => void;
  onConfirmPasswordChange: (val: string) => void;
  newPasswordError?: string;
  confirmPasswordError?: string;
}

const requirements = [
  { label: 'Mínimo 8 caracteres', test: (pw: string) => pw.length >= 8 },
  { label: 'Al menos una letra mayúscula', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Al menos una letra minúscula', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'Al menos un número', test: (pw: string) => /\d/.test(pw) },
];

export function PasswordChangeFields({
  newPassword,
  confirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  newPasswordError,
  confirmPasswordError,
}: PasswordChangeFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Input
          label="Nueva contraseña"
          showPasswordToggle
          placeholder="••••••••"
          autoComplete="new-password"
          value={newPassword}
          onChange={e => onNewPasswordChange(e.target.value)}
          error={newPasswordError}
        />
        {newPassword.length > 0 && (
          <ul className="mt-2 space-y-1">
            {requirements.map(req => {
              const met = req.test(newPassword);
              return (
                <li
                  key={req.label}
                  className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {met ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {req.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Input
        label="Confirmar nueva contraseña"
        showPasswordToggle
        placeholder="••••••••"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={e => onConfirmPasswordChange(e.target.value)}
        error={confirmPasswordError}
      />
    </div>
  );
}
