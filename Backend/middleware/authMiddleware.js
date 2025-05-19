// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the request has an Authorization header and if it starts with "Bearer "
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token from the header (after "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verify if the token is valid using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database using the ID in the token
      // We exclude the password for security reasons
      req.user = await User.findById(decoded.id).select('-password');

      // Allow the request to proceed to the next step (the actual route handler)
      next();
    } catch (error) {
      // If the token is invalid or expired, log the error and send an "Unauthorized" response
      console.error('Authentication error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // If there's no token in the header, send an "Unauthorized" response
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// NGO middleware
export const ngo = (req, res, next) => {
  if (req.user && req.user.role === 'ngo') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an NGO');
  }
};

// Volunteer middleware
export const volunteer = (req, res, next) => {
  if (req.user && req.user.role === 'volunteer') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a volunteer');
  }
};

// Donor middleware
export const donor = (req, res, next) => {
  if (req.user && req.user.role === 'donor') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a donor');
  }
};

// Multiple roles middleware
export const roles = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(401);
      throw new Error('Not authorized for this action');
    }
  };
};