import "./Button.css";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type={type}
      className={`fs-button fs-button-${variant} fs-button-${size}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default Button;