import "./Input.css";

function Input({
  label,
  type = "text",
  name,
  placeholder,
  value = "",
  onChange,
  error,
  required = false,
}) {
  return (
    <div className="fs-input-group">
      {label && (
        <label className="fs-input-label">
          {label}
          {required && <span>*</span>}
        </label>
      )}

      <input
        className={`fs-input ${error ? "fs-input-error" : ""}`}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />

      {error && (
        <p className="fs-input-error-text">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;