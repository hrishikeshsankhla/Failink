import React from 'react';
import { motion } from 'framer-motion';

interface EmojiReactionsProps {
  laugh_count: number;
  fire_count: number;
  check_count: number;
  userReactions: string[];
  onReaction: (emoji: string) => void;
}

const SELECTED_EMOJIS = [
  { emoji: '😂', label: 'Laugh', count: 'laugh_count' },
  { emoji: '🔥', label: 'Fire', count: 'fire_count' },
  { emoji: '✅', label: 'Check', count: 'check_count' },
] as const;

const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  laugh_count,
  fire_count,
  check_count,
  userReactions,
  onReaction,
}) => {
  const getCount = (countType: typeof SELECTED_EMOJIS[number]['count']) => {
    switch (countType) {
      case 'laugh_count':
        return laugh_count;
      case 'fire_count':
        return fire_count;
      case 'check_count':
        return check_count;
      default:
        return 0;
    }
  };

  return (
    <div className="flex gap-4">
      {SELECTED_EMOJIS.map(({ emoji, label, count }) => (
        <motion.button
          key={emoji}
          onClick={() => onReaction(emoji)}
          className="flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={`text-2xl ${userReactions.includes(emoji) ? 'opacity-100' : 'opacity-50'}`}>
            {emoji}
          </span>
          <span className="text-sm text-gray-600 mt-1">
            {getCount(count)}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default EmojiReactions; 