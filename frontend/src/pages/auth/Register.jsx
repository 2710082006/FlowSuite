import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../../context/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import "./Auth.css";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(
        form.name,
        form.email,
        form.password
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);

  setError(
  err.response?.data?.message ||
    err.message ||
    "Unable to create account. Please try again."
);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand">FlowSuite</div>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">
            BUILD TOGETHER
          </span>

          <h1>
            Your team's
            <br />
            new workspace.
          </h1>

          <p>
            Bring projects, people and customers together
            in one intelligent workspace.
          </p>
        </div>

        <div className="auth-visual-footer">
          © 2026 FlowSuite
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="mobile-brand">FlowSuite</div>

          <div className="auth-heading">
            <h2>Create your account</h2>
            <p>
              Start building your workspace today.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <Input
              label="Full name"
              name="name"
              placeholder="Sanjana Singh"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Work email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="password-wrapper">
              <Input
                label="Password"
                name="password"
                type={
                  showPassword ? "text" : "password"
                }
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
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

            {error && (
              <p
                className="auth-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="large"
              loading={loading}
              disabled={loading}
            >
              {!loading && "Create account"}

              {!loading && (
                <ArrowRight size={17} />
              )}
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;