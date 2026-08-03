import React from "react";

/** Shared app button variants — only 2 types for both themes */
export const BTN_PRIMARY =
  "btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export const BTN_SECONDARY =
  "btn-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

/** Compact variants for table action icons / close chips */
export const BTN_PRIMARY_SM =
  "btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export const BTN_SECONDARY_SM =
  "btn-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

export const BTN_ICON =
  "btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-60";

export function PrimaryButton({
  children,
  className = "",
  type = "button",
  size = "md",
  as: Component = "button",
  ...props
}) {
  const base = size === "sm" ? BTN_PRIMARY_SM : BTN_PRIMARY;
  return (
    <Component type={Component === "button" ? type : undefined} className={`${base} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function SecondaryButton({
  children,
  className = "",
  type = "button",
  size = "md",
  as: Component = "button",
  ...props
}) {
  const base = size === "sm" ? BTN_SECONDARY_SM : BTN_SECONDARY;
  return (
    <Component type={Component === "button" ? type : undefined} className={`${base} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export default PrimaryButton;
