import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { TbEyeOff } from "react-icons/tb";

const InputField = ({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  onChange,
  value,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className={`my-4 ${className}`}>
      {label && (
        <label className="mb-2 text-md font-bold block">{label}</label>
      )}

      <div className="relative flex items-center">
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="px-4 py-4 pr-10 w-full text-sm border border-slate-800 bg-transparent rounded-xl transition-all focus:outline-none active:outline-none"
        />

        {/* ICON */}
        {isPassword ? (
          showPassword ? (
            <TbEyeOff
              size={18}
              onClick={() => setShowPassword(false)}
              className="absolute right-4 cursor-pointer text-slate-400"
            />
          ) : (
            <FaEye
              size={18}
              onClick={() => setShowPassword(true)}
              className="absolute right-4 cursor-pointer text-slate-400"
            />
          )
        ) : (
          Icon && (
            <Icon
              size={18}
              className="absolute right-4 text-slate-400"
            />
          )
        )}
      </div>
    </div>
  );
};

export default InputField;