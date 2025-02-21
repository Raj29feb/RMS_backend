import jwt from "jsonwebtoken";
export default function validateJWT(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }
  // Verify and decode the token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = decoded.userId;
    next();
  });
}
