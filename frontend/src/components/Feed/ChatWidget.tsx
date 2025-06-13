import React from 'react';

const ChatWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 w-64 mt-8 mr-8">
      <h2 className="text-sm font-bold text-indigo-700 mb-2">Chat with Aunt Karen</h2>
      <blockquote className="text-gray-600 text-xs italic border-l-2 border-indigo-200 pl-2 mb-2">
        "Oh, another career fail? Darling, I'm starting to think you do this on purpose."
      </blockquote>
      <button className="w-full bg-indigo-600 text-white text-xs rounded px-3 py-1.5 font-medium hover:bg-indigo-700 transition">
        Ask Aunt Karen
      </button>
      <a href="/chat" className="text-indigo-500 text-xs hover:underline block text-right mt-1">
        Open Full Chat
      </a>
    </div>
  );
};

export default ChatWidget; 