'use client';

interface ProfileNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ProfileNameInput({ value, onChange, disabled }: ProfileNameInputProps) {
  return (
    <div>
      <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">
        Название профиля
      </label>
      <input
        id="profileName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Например: AI Practicum"
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-black focus:border-black
          placeholder:text-gray-400
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      />
      <p className="text-xs text-gray-500 mt-1">
        Название будет использоваться для контекста генерации
      </p>
    </div>
  );
}
