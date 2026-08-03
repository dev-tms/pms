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

export const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#0f172a",
      borderColor: state.isFocused ? "#38bdf8" : "#334155",
      boxShadow: state.isFocused ? "0 0 0 1px #38bdf8" : "none",
      borderRadius: "1rem",
      minHeight: 48,
      paddingLeft: 4,
      ":hover": { borderColor: state.isFocused ? "#38bdf8" : "#475569" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "1rem",
      overflow: "hidden",
      zIndex: 30,
    }),
    menuList: (base) => ({
      ...base,
      padding: 6,
      backgroundColor: "#0f172a",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#1e293b" : "#0f172a",
      color: "#e2e8f0",
      borderRadius: 10,
      cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: "#f8fafc" }),
    input: (base) => ({ ...base, color: "#f8fafc" }),
    placeholder: (base) => ({ ...base, color: "#64748b" }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: "#334155" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
  };