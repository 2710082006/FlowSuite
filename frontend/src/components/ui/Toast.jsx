import { CheckCircle2, X, XCircle } from "lucide-react";
import "./Toast.css";

function Toast({
  message,
  type = "success",
  onClose,
}) {
  const Icon =
    type === "error"
      ? XCircle
      : CheckCircle2;

  return (
    <div className={`fs-toast fs-toast-${type}`}>
      <Icon size={18} />

      <span>{message}</span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default Toast;