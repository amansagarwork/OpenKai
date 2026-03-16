import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { Favorite } from '../models';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

function signToken(payload: { userId: string; email: string; username: string }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body as { email?: string; password?: string; username?: string };

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(normalizedUsername)) {
      return res.status(400).json({ error: 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      } else {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: normalizedEmail,
      username: normalizedUsername,
      password_hash: passwordHash
    });

    await newUser.save();

    const token = signToken({ userId: newUser._id.toString(), email: newUser.email, username: newUser.username });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email' });
    }

    const ok = await user.comparePassword(password);

    if (!ok) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email, username: user.username });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response) => {
  const user = (req as any).user as { userId: number; email: string; username: string } | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.status(200).json({ user });
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userData = await User.findById(user.userId).lean();
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get favorites from separate table
    const favorites = await Favorite.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Transform favorites to match expected format
    const transformedFavorites = favorites.map(fav => ({
      id: fav.itemId,
      type: fav.itemType,
      title: fav.title,
      slug: fav.slug,
      createdAt: fav.createdAt
    }));

    res.status(200).json({
      user: {
        id: userData._id,
        email: userData.email,
        username: userData.username,
        createdAt: userData.created_at,
      },
      settings: userData.settings || { emailNotifications: true, darkMode: false, twoFactorAuth: false },
      favorites: transformedFavorites,
      stats: {
        pastesCreated: 0, // TODO: Update when paste model is migrated
        urlsShortened: 0, // TODO: Update when URL model is migrated
        favoritesCount: favorites.length,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { emailNotifications, darkMode, twoFactorAuth } = req.body;
    
    const settings = {
      emailNotifications: !!emailNotifications,
      darkMode: !!darkMode,
      twoFactorAuth: !!twoFactorAuth
    };

    await User.findByIdAndUpdate(user.userId, { settings });

    res.status(200).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username: newUsername } = req.body;
    
    if (!newUsername || !newUsername.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const normalizedUsername = newUsername.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(normalizedUsername)) {
      return res.status(400).json({ error: 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens' });
    }

    // Check if trying to update to current username
    if (normalizedUsername === user.username.toLowerCase()) {
      return res.status(400).json({ error: 'Username is the same as current username' });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({ 
      username: normalizedUsername,
      _id: { $ne: user.userId }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    await User.findByIdAndUpdate(user.userId, { username: normalizedUsername });

    // Generate new token with updated username
    const newToken = signToken({ userId: user.userId, email: user.email, username: normalizedUsername });

    res.status(200).json({ 
      message: 'Username updated successfully',
      token: newToken,
      user: {
        id: user.userId,
        email: user.email,
        username: normalizedUsername
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, type, title, slug } = req.body;
    
    if (!id || !type || !title || !slug) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already exists
    const existingFavorite = await Favorite.findOne({ 
      userId: user.userId, 
      itemId: id 
    });
    
    if (existingFavorite) {
      return res.status(409).json({ error: 'Already in favorites' });
    }

    // Create new favorite
    const newFavorite = new Favorite({
      userId: user.userId,
      itemId: id,
      itemType: type,
      title,
      slug
    });

    await newFavorite.save();

    res.status(201).json({ 
      message: 'Added to favorites', 
      favorite: {
        id: newFavorite.itemId,
        type: newFavorite.itemType,
        title: newFavorite.title,
        slug: newFavorite.slug,
        createdAt: newFavorite.createdAt
      }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    
    const result = await Favorite.deleteOne({ 
      userId: user.userId, 
      itemId: id 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { userId: string; email: string; username: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete user's favorites
    await Favorite.deleteMany({ userId: user.userId });
    
    // Delete user
    await User.findByIdAndDelete(user.userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
