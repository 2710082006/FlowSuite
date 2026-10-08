import "./Badge.css";

function Badge({ children, variant = "default" }) {
  return (
    <span className={`fs-badge fs-badge-${variant}`}>
      {children}
    </span>
  );
}

export default Badge;