import { clerkClient } from "@clerk/express";

// Middleware to allow only admin users to access the route
export const protectAdmin = async (req, res, next) => {
  try {
    // Extract userId from the authenticated request (no parentheses)
    const { userId } = req.auth();

    // Check if userId exists
    // if (!userId) {
    //   return res.status(401).json({ success: false, message: "User not authenticated" });
    // }

    // Fetch the full user data from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Check if user has admin role in their private metadata
    if (user.privateMetadata.role !== 'admin') {
      return res.json({ success: false, message: "Not authorized" });
    }

    // User is authorized – allow access
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.json({ success: false, message: "Not authorized" });
  }
};
