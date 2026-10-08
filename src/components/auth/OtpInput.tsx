import React, { useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange, disabled = false }) => {
  const [otp, setOtp] = useState<string[]>(
    value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length)
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const text = e.target.value;
    if (!/^[0-9A-Za-z]*$/.test(text)) return; 

    const newOtp = [...otp];
    newOtp[index] = text.substring(text.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(''));

    if (text && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9A-Za-z]/g, '').slice(0, length);
    
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      onChange(newOtp.join(''));

      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3 w-full">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default OtpInput;