const Subscription = require("../models/Subscription");

const getWorkspaceSubscription = async (workspaceId) => {
  if (!workspaceId) {
    return null;
  }

  const subscription = await Subscription.findOne({
    workspace: workspaceId,
  }).populate("plan");

  return subscription;
};

const hasFeature = async (workspaceId, feature) => {
  const subscription =
    await getWorkspaceSubscription(workspaceId);

  if (!subscription || !subscription.plan) {
    return false;
  }

  if (
    subscription.status === "cancelled" ||
    subscription.status === "expired"
  ) {
    return false;
  }

  return Boolean(subscription.plan.features?.[feature]);
};

const getFeatureLimit = async (
  workspaceId,
  limitName
) => {
  const subscription =
    await getWorkspaceSubscription(workspaceId);

  if (!subscription || !subscription.plan) {
    return 0;
  }

  if (
    subscription.status === "cancelled" ||
    subscription.status === "expired"
  ) {
    return 0;
  }

  return (
    subscription.plan.features?.[limitName] ?? 0
  );
};

module.exports = {
  getWorkspaceSubscription,
  hasFeature,
  getFeatureLimit,
};