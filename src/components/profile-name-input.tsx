'use client';

interface ProfileNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ProfileNameInput({ value, onChange, disabled }: ProfileNameInputProps) {
  return (
    <div>
      <label htmlFor="profileName" className="block text-sm font-medium text-[#1d1d1f] mb-2">
        Название профиля
      </label>
      <input
        id="profileName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Например: AI Practicum"
        className={`apple-input ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}
