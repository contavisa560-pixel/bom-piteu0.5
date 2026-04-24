import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className, children }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
      animate={{ x: '100%' }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
    />
    {children}
  </div>
);