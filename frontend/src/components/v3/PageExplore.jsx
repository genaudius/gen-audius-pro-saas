import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, TrendingUp, Star, Play } from 'lucide-react';

export default function PageExplore() {
    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
                    <LayoutGrid className="text-[#D4AF37]" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Explorar</h1>
                    <p className="text-white/40 text-sm">Descubre las creaciones más trending de la comunidad.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-white/5 rounded-3xl p-6 border border-white/5 group relative overflow-hidden"
                    >
                        <div className="aspect-square bg-white/10 rounded-2xl mb-4 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                            <TrendingUp size={48} className="text-white/10" />
                        </div>
                        <h3 className="font-bold text-white mb-1">Trending Hit #{i}</h3>
                        <p className="text-white/40 text-xs mb-4 uppercase tracking-widest">Bachata ADN · Artist #{i}</p>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Star size={12} className="text-[#D4AF37]" fill="#D4AF37" />
                                <span className="text-[10px] font-bold text-white/60">4.8k Likes</span>
                            </div>
                            <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                                <Play size={14} fill="black" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
