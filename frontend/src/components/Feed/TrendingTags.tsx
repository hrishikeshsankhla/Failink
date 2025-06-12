import React from 'react';
import { motion } from 'framer-motion';

interface Tag {
  id: number;
  name: string;
}

interface TagWithCount {
  tag: Tag;
  post_count: number;
}

interface TrendingTagsProps {
  tags: TagWithCount[];
}

const TrendingTags: React.FC<TrendingTagsProps> = ({ tags }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Trending Tags</h2>
      <div className="space-y-3">
        {tags.map((tag, index) => (
          <motion.div
            key={tag.tag.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div>
              <span className="font-medium text-gray-800">#{tag.tag.name}</span>
              <p className="text-sm text-gray-500">{tag.post_count} posts</p>
            </div>
            <span className="text-blue-500 text-sm">Follow</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTags; 