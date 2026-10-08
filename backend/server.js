const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const teamRoutes = require("./routes/teamRoutes");
const customerRoutes = require("./routes/customerRoutes");
const billingRoutes = require("./routes/billingRoutes");
const auditRoutes = require("./routes/auditRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const {
  startTaskNotificationScheduler,
} = require("./services/taskNotificationScheduler");
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FlowSuite API is running",
  });
});
app.get("/api/billing-test", (req, res) => {
  res.json({
    success: true,
    message: "Billing route test is working",
  });
});

// AUTH ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(
  "/api/notifications",
  notificationRoutes
);
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FlowSuite server running on port ${PORT}`);
   startTaskNotificationScheduler();
});