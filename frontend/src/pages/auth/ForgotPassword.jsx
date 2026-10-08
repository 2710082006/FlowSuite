import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to process your request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Forgot Password?</h1>
          <p>
            Enter your email address and we'll help you
            reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <div className="forgot-password-error">
              {error}
            </div>
          )}

          {message && (
            <div className="forgot-password-success">
              {message}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={!email}
          >
            Send Reset Link
          </Button>
        </form>

        <Link
          to="/login"
          className="forgot-password-back"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;