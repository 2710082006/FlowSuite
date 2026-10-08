import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "./ResetPassword.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters long"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        `/auth/reset-password/${token}`,
        {
          newPassword,
        }
      );

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Reset Password</h1>
          <p>
            Create a new password for your FlowSuite
            account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          {error && (
            <div className="reset-password-error">
              {error}
            </div>
          )}

          {success && (
            <div className="reset-password-success">
              {success}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={!newPassword || !confirmPassword}
          >
            Reset Password
          </Button>
        </form>

        <Link
          to="/login"
          className="reset-password-back"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;