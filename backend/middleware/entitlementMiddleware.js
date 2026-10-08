
const Subscription = require("../models/Subscription");

const checkEntitlement = (
  feature,
  usageGetter = null
) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.user?.workspaceId;

      if (!workspaceId) {
        return res.status(401).json({
          success: false,
          message: "Workspace information is missing",
        });
      }

      const subscription =
        await Subscription.findOne({
          workspace: workspaceId,
          status: {
            $in: ["trialing", "active"],
          },
        }).populate("plan");

      if (
        !subscription ||
        !subscription.plan
      ) {
        return res.status(403).json({
          success: false,
          message:
            "No active subscription found",
        });
      }

      const plan = subscription.plan;

      const featureValue =
        plan.features?.[feature];

      // --------------------------------
      // BOOLEAN FEATURE
      // --------------------------------

      if (typeof featureValue === "boolean") {
        if (!featureValue) {
          return res.status(403).json({
            success: false,
            message:
              `${plan.displayName} plan does not include ${feature}`,
            feature,
            currentPlan: plan.name,
            upgradeRequired: true,
          });
        }

        req.subscription = subscription;
        req.plan = plan;

        return next();
      }

      // --------------------------------
      // NUMERIC LIMIT
      // --------------------------------

      if (typeof featureValue === "number") {
        // Unlimited
        if (featureValue === -1) {
          req.subscription = subscription;
          req.plan = plan;
          req.planLimit = -1;
          req.currentUsage = 0;

          return next();
        }

        // No usage checker supplied
        if (!usageGetter) {
          req.subscription = subscription;
          req.plan = plan;
          req.planLimit = featureValue;

          return next();
        }

        const currentUsage =
          await usageGetter(workspaceId);

        if (currentUsage >= featureValue) {
          return res.status(403).json({
            success: false,
            message:
              `${plan.displayName} plan limit reached for ${feature}`,
            feature,
            limit: featureValue,
            currentUsage,
            currentPlan: plan.name,
            upgradeRequired: true,
          });
        }

        req.subscription = subscription;
        req.plan = plan;
        req.planLimit = featureValue;
        req.currentUsage = currentUsage;

        return next();
      }

      return res.status(403).json({
        success: false,
        message:
          `Feature ${feature} is not configured for this plan`,
        feature,
        currentPlan: plan.name,
      });
    } catch (error) {
      console.error(
        "Entitlement middleware error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to verify plan entitlement",
      });
    }
  };
};

module.exports = checkEntitlement;

