
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

import { useAuth } from "../../context/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import "./Auth.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Clear error when user starts typing again
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await login(form.email, form.password);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT VISUAL SECTION */}
      <div className="auth-visual">
        <div className="auth-brand">
          FlowSuite
        </div>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">
            WORK SMARTER
          </span>

          <h1>
            One workspace.
            <br />
            Infinite possibilities.
          </h1>

          <p>
            Manage projects, teams, customers and workflows
            from one powerful workspace.
          </p>
        </div>

        <div className="auth-visual-footer">
          © 2026 FlowSuite
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="auth-form-section">
        <div className="auth-form-wrapper">

          <div className="mobile-brand">
            FlowSuite
          </div>

          <div className="auth-heading">
            <h2>Welcome back</h2>

            <p>
              Sign in to continue to your workspace.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {/* EMAIL */}
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
              error={
                error &&
                !form.email
                  ? "Email is required"
                  : ""
              }
            />

            {/* PASSWORD */}
            <div className="password-wrapper">

              <Input
                label="Password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

            {/* OPTIONS */}
            <div className="auth-options">

              <label>
                <input
                  type="checkbox"
                  name="remember"
                />

                <span>
                  Remember me
                </span>
              </label>

             <Link
  to="/forgot-password"
  className="forgot-password"
>
  Forgot password?
</Link>

            </div>

            {/* ERROR */}
            {error && (
              <p
                className="auth-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* LOGIN BUTTON */}
            <Button
              type="submit"
              size="large"
              loading={loading}
              disabled={loading}
            >
              Sign in

              {!loading && (
                <ArrowRight size={17} />
              )}
            </Button>

          </form>

                  {/* REGISTER LINK */}
          <p className="auth-switch">
            Don't have an account?{" "}

            <Link to="/register">
              Create account
            </Link>

          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;

