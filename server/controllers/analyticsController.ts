import { Request, Response } from 'express';
import { Favorite, Service } from '../models';

// Algorithm to calculate featured services based on multiple factors
export const getFeaturedServices = async (req: Request, res: Response) => {
  try {
    const { limit = 4 } = req.query;
    const limitNum = parseInt(limit as string);

    // Step 1: Get all services from database
    const allServices = await Service.find({}).lean();

    // Step 2: Get favorite counts for each service
    const favoriteStats = await Favorite.aggregate([
      { $match: { itemType: 'tool' } },
      {
        $group: {
          _id: '$itemId',
          favoriteCount: { $sum: 1 },
          lastFavorited: { $max: '$createdAt' }
        }
      }
    ]);

    // Step 3: Create a map of favorite counts
    const favoriteMap = new Map(
      favoriteStats.map(stat => [stat._id, stat])
    );

    // Step 4: Calculate featured score for each service
    const servicesWithScores = allServices.map(service => {
      const favData = favoriteMap.get(service.id) || { favoriteCount: 0, lastFavorited: null };
      
      // Base score from favorite count
      let score = favData.favoriteCount * 10;
      
      // Bonus for recent favorites (exponential decay)
      let recencyBonus = 0;
      let daysSinceFavorited = 0;
      if (favData.lastFavorited) {
        daysSinceFavorited = (Date.now() - new Date(favData.lastFavorited).getTime()) / (1000 * 60 * 60 * 24);
        recencyBonus = Math.max(0, 50 * Math.exp(-daysSinceFavorited / 7)); // Decay over 7 days
        score += recencyBonus;
      }
      
      // Bonus for featured services
      if (service.featured) {
        score += 100;
      }

      return {
        ...service,
        slug: service.href.replace(/^\//, ''), // Remove leading slash to avoid double slashes
        favoriteCount: favData.favoriteCount,
        featuredScore: Math.round(score),
        trending: favData.favoriteCount > 5 && daysSinceFavorited < 7
      };
    });

    // Step 5: Sort by featured score and get top N
    const featuredServices = servicesWithScores
      .sort((a, b) => b.featuredScore - a.featuredScore)
      .slice(0, limitNum);

    res.status(200).json({
      featured: featuredServices,
      total: featuredServices.length,
      algorithm: {
        factors: ['favoriteCount', 'recency', 'featured', 'usage'],
        weights: { favorite: 10, recency: 'exponential', featured: 100, usage: 5 }
      }
    });
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getItemFavorites = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    // Get all favorites for this item with user details
    const favorites = await Favorite.find({ itemId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    const transformedFavorites = favorites.map(fav => ({
      userId: (fav.userId as any)._id || fav.userId,
      username: (fav.userId as any).username,
      email: (fav.userId as any).email,
      favoritedAt: fav.createdAt,
      itemType: fav.itemType,
      title: fav.title,
      slug: fav.slug
    }));

    res.status(200).json({
      itemId,
      totalFavorites: favorites.length,
      favorites: transformedFavorites
    });
  } catch (error) {
    console.error('Get item favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPopularItems = async (req: Request, res: Response) => {
  try {
    const { type, limit = 10 } = req.query;
    
    // Build match condition
    const matchCondition: any = {};
    if (type) {
      matchCondition.itemType = type;
    }

    // Aggregate favorites by item
    const popularItems = await Favorite.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$itemId',
          itemId: { $first: '$itemId' },
          title: { $first: '$title' },
          slug: { $first: '$slug' },
          itemType: { $first: '$itemType' },
          favoriteCount: { $sum: 1 },
          firstFavorited: { $min: '$createdAt' },
          lastFavorited: { $max: '$createdAt' }
        }
      },
      { $sort: { favoriteCount: -1, lastFavorited: -1 } },
      { $limit: parseInt(limit as string) }
    ]);

    res.status(200).json({
      popularItems,
      total: popularItems.length
    });
  } catch (error) {
    console.error('Get popular items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserFavoriteStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's favorite statistics by type
    const statsByType = await Favorite.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$itemType',
          count: { $sum: 1 },
          items: { $push: { itemId: '$itemId', title: '$title', createdAt: '$createdAt' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalFavorites = await Favorite.countDocuments({ userId });

    res.status(200).json({
      userId,
      totalFavorites,
      favoritesByType: statsByType
    });
  } catch (error) {
    console.error('Get user favorite stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
