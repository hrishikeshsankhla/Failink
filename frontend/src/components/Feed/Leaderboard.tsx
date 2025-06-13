import React from 'react';

const leaderboard = [
  { name: 'Jane P.', fails: 1500, medal: '🥇' },
  { name: 'Alex L.', fails: 1200, medal: '🥈' },
  { name: 'Sarah K.', fails: 980, medal: '🥉' },
];

const Leaderboard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2">
        Weekly Fail King/Queen
      </h2>
      <ul className="space-y-3">
        {leaderboard.map((user, idx) => (
          <li key={user.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user.medal}</span>
              <span className="font-medium text-gray-800">{user.name}</span>
            </div>
            <span className="text-indigo-600 font-semibold">{user.fails} Fails</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard; 