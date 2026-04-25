import React from 'react';
import { motion } from 'framer-motion';

export const LogoIcon = ({ size = 160, className = "" }) => (
    <motion.div
        style={{ width: size, height: size }}
        className={`relative flex items-center justify-center ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
    >
        <img 
            src="/assets/brand/icon.png" 
            alt="Gen Audius" 
            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        />
    </motion.div>
);

export const LogoFull = ({ height = 40, className = "" }) => (
    <div className={`flex items-center gap-3 ${className}`} style={{ height }}>
        <img 
            src="/assets/brand/sidebar_logo.png" 
            alt="Gen Audius" 
            className="h-full w-auto object-contain"
        />
    </div>
);
