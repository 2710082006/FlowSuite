const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader ? "PRESENT" : "MISSING");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token ? "PRESENT" : "MISSING");
    console.log(
      "JWT SECRET:",
      process.env.JWT_SECRET ? "PRESENT" : "MISSING"
    );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("JWT DECODED:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = protect;