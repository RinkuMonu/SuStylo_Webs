import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔹 Middleware: Authenticate & Authorize
 * - Verifies JWT token
 * - Attaches decoded user to req.user
 * - Checks role authorization if roles are provided
 */
export const authenticateAndAuthorize = (allowedRoles = [], messages = {}) => {
  return (req, res, next) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: messages.unauthorizedMsg || "No token provided!" });
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: "Invalid token!" });
        }

        // req.user = decoded;
        req.user = {
          ...decoded,
          _id: decoded.id || decoded._id,
        };

        // 🔹 Role check
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
          return res
            .status(403)
            .json({ success: false, message: messages.forbiddenMsg || "Forbidden!" });
        }

        next();
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "Auth error: " + err.message });
    }
  };
};
