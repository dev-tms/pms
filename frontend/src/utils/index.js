/**
 * Set localStorage
 */
export const setStore = (name, content) => {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
  return window.localStorage.setItem(name, content)
}

/**
  * Get localStorage
*/
export const getStore = (name) => {
  if (!name) return
  return JSON.parse(window.localStorage.getItem(name))
}

/**
 * Clear localStorage
*/
export const removeItem = (name) => {
  if (!name) return
  return window.localStorage.removeItem(name)
}

/**
 * Validate Email address
 */
export const isValidEmail = (value) => {
  return !(value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,64}$/i.test(value))
}

/**
 * Format Phone Number
 */
export const formatPhoneNumber = (value) => {
  if (!value) return
  const currentValue = value.replace(/[^\d]/g, '');
  const mobileNoLength = currentValue.length;
  if (mobileNoLength >=7) {
    if (mobileNoLength < 4) return currentValue;
    if (mobileNoLength < 7) return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;
    return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`;
  } else{
    return currentValue;
  }
}

export const isValidPhoneNumber = (value) => {
  return !(value && !/^\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/i.test(value));
}

export const timeToMills = (timeSpentHours, timeSpentMinutes) => {
  return (parseInt(timeSpentHours ? timeSpentHours : 0)*(1000*60*60))+(timeSpentMinutes? timeSpentMinutes*(1000*60) : 0);
}

export const dateMin = (years=50) => {
  const yearsAgo = new Date();
  yearsAgo.setFullYear(yearsAgo.getFullYear() - years);
  const minDate = yearsAgo.toISOString().split('T')[0];
  return minDate;
}

export const dateMax = () => {
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  return maxDate;
}

const readThemeVar = (name, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: readThemeVar("--app-input-bg", "#0f172a"),
      borderColor: state.isFocused ? "#38bdf8" : readThemeVar("--app-input-border", "#334155"),
      boxShadow: state.isFocused ? "0 0 0 1px #38bdf8" : "none",
      borderRadius: "1rem",
      minHeight: 48,
      paddingLeft: 4,
      color: readThemeVar("--app-text", "#f8fafc"),
      ":hover": {
        borderColor: state.isFocused ? "#38bdf8" : readThemeVar("--app-ghost-hover-border", "#475569"),
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: readThemeVar("--app-dropdown-bg", "#0f172a"),
      border: `1px solid ${readThemeVar("--app-border", "#334155")}`,
      borderRadius: "1rem",
      overflow: "hidden",
      zIndex: 30,
    }),
    menuList: (base) => ({
      ...base,
      padding: 6,
      backgroundColor: readThemeVar("--app-dropdown-bg", "#0f172a"),
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? readThemeVar("--app-select-option-hover", "#1e293b")
        : readThemeVar("--app-dropdown-bg", "#0f172a"),
      color: readThemeVar("--app-text", "#e2e8f0"),
      borderRadius: 10,
      cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: readThemeVar("--app-text", "#f8fafc") }),
    input: (base) => ({ ...base, color: readThemeVar("--app-text", "#f8fafc") }),
    placeholder: (base) => ({ ...base, color: readThemeVar("--app-placeholder", "#64748b") }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: readThemeVar("--app-border", "#334155"),
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: readThemeVar("--app-muted-text", "#94a3b8"),
    }),
  };

export const appInputCls =
  "app-input w-full rounded-2xl border px-4 py-3 text-sm outline-none transition min-h-[48px] focus:border-sky-400";
export const appLabelCls = "app-label mb-2 block text-sm";
export const appModalOverlayCls =
  "app-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm";
export const appModalCls =
  "app-modal w-full max-w-3xl rounded-[28px] border p-6 overflow-y-auto max-h-[90vh]";
export const appBtnGhostCls =
  "app-btn-ghost rounded-xl border px-3 py-2 text-sm transition";