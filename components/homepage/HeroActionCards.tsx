import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Target, ChevronRight } from 'lucide-react';

interface HeroActionCardsProps {
  onPostJob: () => void;
  onFindTalent: () => void;
}

const HeroActionCards: React.FC<HeroActionCardsProps> = ({ onPostJob, onFindTalent }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Post a Job Card */}
      <motion.button
        onClick={onPostJob}
        className="h-[180px] bg-white rounded-[1.25rem] border-2 border-gray-100 p-8 text-left shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Briefcase className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Post a Job</h3>
          </div>

          <p className="text-gray-500 text-sm font-medium mb-4 max-w-[280px]">
            Get precision-matched candidates in hours, not weeks
          </p>

          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
            <span>Create Posting</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </motion.button>

      {/* Find Talent Card */}
      <motion.button
        onClick={onFindTalent}
        className="h-[180px] bg-white rounded-[1.25rem] border-2 border-gray-100 p-8 text-left shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
              <Target className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Find Talent</h3>
          </div>

          <p className="text-gray-500 text-sm font-medium mb-4 max-w-[280px]">
            Search with 8-dimensional precision matching
          </p>

          <div className="flex items-center gap-2 text-purple-600 font-bold text-sm group-hover:gap-3 transition-all">
            <span>Search Now</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </motion.button>
    </div>
  );
};

export default HeroActionCards;
