import { useEffect, useState } from "react";
import {
  Check,
  Crown,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";

import api from "../../services/api";

import "./Billing.css";

function Billing() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const handleCancelSubscription = async () => {
  setActionLoading("cancel");
  setActionError("");
  setActionMessage("");

  try {
    const response = await api.put(
      "/billing/subscription/cancel"
    );

    setSubscription(
      response.data.subscription
    );

    setActionMessage(
      "Subscription cancellation scheduled successfully"
    );
  } catch (error) {
    console.error(
      "Cancel subscription error:",
      error
    );

    setActionError(
      error.response?.data?.message ||
        "Failed to cancel subscription"
    );
  } finally {
    setActionLoading("");
  }
};

const handleReactivateSubscription = async () => {
  setActionLoading("reactivate");
  setActionError("");
  setActionMessage("");

  try {
    const response = await api.put(
      "/billing/subscription/reactivate"
    );

    setSubscription(
      response.data.subscription
    );

    setActionMessage(
      "Subscription reactivated successfully"
    );
  } catch (error) {
    console.error(
      "Reactivate subscription error:",
      error
    );

    setActionError(
      error.response?.data?.message ||
        "Failed to reactivate subscription"
    );
  } finally {
    setActionLoading("");
  }
};
  useEffect(() => {
    let cancelled = false;

    const fetchBilling = async () => {
      try {
        const [
          plansResponse,
          subscriptionResponse,
        ] = await Promise.all([
          api.get("/billing/plans"),
          api.get("/billing/subscription"),
        ]);

        if (cancelled) return;

        setPlans(plansResponse.data.plans || []);

        setSubscription(
          subscriptionResponse.data.subscription || null
        );

        setError("");
      } catch (error) {
        if (cancelled) return;

        console.error("Billing load error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load billing information"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBilling();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRetryCount((count) => count + 1);
  };

  const handleChangePlan = async (planId) => {
    setActionLoading(planId);
    setActionError("");
    setActionMessage("");

    try {
      const response = await api.put(
        "/billing/subscription/plan",
        {
          planId,
          billingCycle: "monthly",
        }
      );

      setSubscription(
        response.data.subscription
      );

      setActionMessage(
        "Subscription plan updated successfully"
      );
    } catch (error) {
      console.error(
        "Change plan error:",
        error
      );

      setActionError(
        error.response?.data?.message ||
          "Failed to change subscription plan"
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="billing-loading">
        <Loader2
          size={30}
          className="billing-spinner"
        />

        <p>Loading billing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="billing-page">
        <div className="billing-error">
          <ShieldCheck size={32} />

          <h2>Unable to load billing</h2>

          <p>{error}</p>

          <button
            className="billing-retry"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-page">
      <div className="billing-header">
        <div>
          <span className="billing-eyebrow">
            WORKSPACE BILLING
          </span>

          <h1>Plans & Billing</h1>

          <p>
            Manage your FlowSuite subscription,
            features and workspace limits.
          </p>
        </div>

        {subscription?.plan && (
          <div className="billing-current-plan">
            <div className="billing-current-icon">
              <Crown size={20} />
            </div>

            <div>
              <span>Current Plan</span>

              <strong>
                {subscription.plan.displayName}
              </strong>
            </div>
          </div>
        )}
      </div>

      {subscription?.plan && (
        <div className="subscription-card">
          <div className="subscription-left">
            <div className="subscription-icon">
              <Zap size={20} />
            </div>

            <div>
              <span className="subscription-label">
                {subscription.cancelAtPeriodEnd
                  ? "CANCELLATION SCHEDULED"
                  : "ACTIVE SUBSCRIPTION"}
              </span>

              <h3>
                {subscription.plan.displayName}
              </h3>

              <p>
                Your workspace is currently using the{" "}
                {subscription.plan.displayName} plan.
              </p>
            </div>
          </div>

          <div className="subscription-status">
            <span className="status-dot" />

            {subscription.status}
          </div>
          <div className="subscription-actions">
  {subscription.cancelAtPeriodEnd ? (
    <button
      className="subscription-action-button"
      onClick={handleReactivateSubscription}
      disabled={actionLoading === "reactivate"}
    >
      {actionLoading === "reactivate"
        ? "Reactivating..."
        : "Reactivate Subscription"}
    </button>
  ) : (
    <button
      className="subscription-action-button subscription-cancel-button"
      onClick={handleCancelSubscription}
      disabled={actionLoading === "cancel"}
    >
      {actionLoading === "cancel"
        ? "Cancelling..."
        : "Cancel Subscription"}
    </button>
  )}
</div>
        </div>
      )}

      {(actionMessage || actionError) && (
        <div className="billing-action-message">
          {actionMessage && (
            <div className="billing-action-success">
              {actionMessage}
            </div>
          )}

          {actionError && (
            <div className="billing-action-error">
              {actionError}
            </div>
          )}
        </div>
      )}

      <section className="plans-section">
        <div className="plans-section-header">
          <div>
            <span>CHOOSE YOUR PLAN</span>

            <h2>Scale with FlowSuite</h2>

            <p>
              Upgrade your workspace as your team grows.
            </p>
          </div>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => {
            const isCurrent =
              subscription?.plan?._id === plan._id;

            return (
              <PlanCard
                key={plan._id}
                plan={plan}
                isCurrent={isCurrent}
                onChangePlan={handleChangePlan}
                actionLoading={actionLoading}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  onChangePlan,
  actionLoading,
}) {
  const isEnterprise =
    plan.name === "enterprise";

  const isUpdating =
    actionLoading === plan._id;

  return (
    <article
      className={`plan-card ${
        isCurrent ? "plan-card-current" : ""
      }`}
    >
      {isCurrent && (
        <div className="plan-current-badge">
          Current Plan
        </div>
      )}

      <div className="plan-icon">
        <Crown size={20} />
      </div>

      <h3>{plan.displayName}</h3>

      <p className="plan-description">
        {plan.description}
      </p>

      <div className="plan-price">
        {isEnterprise ? (
          <strong>Custom</strong>
        ) : (
          <>
            <strong>
              ₹{plan.price.monthly.toLocaleString("en-IN")}
            </strong>

            <span>/month</span>
          </>
        )}
      </div>

      <div className="plan-divider" />

      <div className="plan-features">
        <Feature
          label={`${formatLimit(
            plan.features.maxProjects
          )} projects`}
        />

        <Feature
          label={`${formatLimit(
            plan.features.maxMembers
          )} team members`}
        />

        <Feature
          label={`${formatLimit(
            plan.features.maxCustomers
          )} customers`}
        />

        <Feature
          label="Advanced analytics"
          enabled={plan.features.advancedAnalytics}
        />

        <Feature
          label="Audit logs"
          enabled={plan.features.auditLogs}
        />

        <Feature
          label="Custom roles"
          enabled={plan.features.customRoles}
        />

        <Feature
          label="API access"
          enabled={plan.features.apiAccess}
        />

        <Feature
          label="Priority support"
          enabled={plan.features.prioritySupport}
        />
      </div>

      <button
        className={`plan-button ${
          isCurrent
            ? "plan-button-current"
            : ""
        }`}
        disabled={
          isCurrent ||
          isUpdating ||
          isEnterprise
        }
        onClick={() =>
          onChangePlan(plan._id)
        }
      >
        {isCurrent
          ? "Current Plan"
          : isUpdating
          ? "Updating..."
          : isEnterprise
          ? "Contact Sales"
          : "Change Plan"}
      </button>
    </article>
  );
}

function Feature({
  label,
  enabled = true,
}) {
  return (
    <div
      className={`plan-feature ${
        enabled
          ? ""
          : "plan-feature-disabled"
      }`}
    >
      <Check size={16} />

      <span>{label}</span>
    </div>
  );
}

function formatLimit(value) {
  return value === -1
    ? "Unlimited"
    : value.toLocaleString("en-IN");
}

export default Billing;