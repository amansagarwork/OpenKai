'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, Link2, Terminal, Code, Target, Sparkles, 
  Shuffle, FileJson, Unlock, Hash, Shield, TrendingUp,
  Star, ArrowRight, Zap, Heart
} from 'lucide-react';

interface FeaturedService {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
  slug: string;
  favoriteCount: number;
  featuredScore: number;
  trending: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Link2,
  Terminal,
  Code,
  Target,
  Sparkles,
  Shuffle,
  FileJson,
  Unlock,
  Hash,
  Shield,
  TrendingUp,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'DevTools': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  'Utilities': { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  'Security': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  'Productivity': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  'default': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
};

export default function FeaturedSection() {
  const router = useRouter();
  const [featured, setFeatured] = useState<FeaturedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/analytics/featured?limit=4`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          setFeatured(data.featured);
        }
      } catch (error) {
        console.error('Failed to fetch featured services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-80 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-200">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured</h2>
            <p className="text-sm text-slate-500">Most popular and frequently used tools</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span>Algorithm-powered</span>
          </div>
        </div>

        {/* Two-Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - 4 Services Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map((service, index) => {
              const Icon = iconMap[service.icon] || FileText;
              const colors = categoryColors[service.category] || categoryColors.default;
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(`/${service.slug}`)}
                  className={`group relative p-5 rounded-2xl border ${colors.border} ${colors.bg} 
                    hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 
                    transition-all duration-300 cursor-pointer overflow-hidden`}
                >
                  {/* Trending Badge */}
                  {service.trending && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      Hot
                    </div>
                  )}

                  {/* Favorite Count */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-slate-400 text-xs">
                    <Heart className="w-3 h-3" />
                    {service.favoriteCount}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white shadow-sm ${colors.text}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 pr-12">
                      <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-white ${colors.text}`}>
                          {service.category}
                        </span>
                        {service.featuredScore > 100 && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-600" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Side - Featured Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative h-80 lg:h-auto rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 group cursor-pointer"
            onClick={() => router.push('/discover')}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Discover More
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Explore All Tools
                </h3>
                <p className="text-slate-300 text-sm">
                  Discover 17+ powerful tools designed to boost your productivity and streamline your workflow.
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Total Tools</span>
                  <span className="text-white font-semibold">17+</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Categories</span>
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Active Users</span>
                  <span className="text-white font-semibold">1000+</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full mt-4 py-3 px-4 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                Browse All Tools
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Glow Effect */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-colors"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
