import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../../utils/getMediaUrl';

interface ProfileLinkProps {
  user: {
    id: string;
    username: string;
    profile_picture?: string | null;
  };
  showPicture?: boolean;
  showUsername?: boolean;
  pictureSize?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const ProfileLink: React.FC<ProfileLinkProps> = ({
  user,
  showPicture = true,
  showUsername = true,
  pictureSize = 'md',
  className = '',
  children
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${user.id}`);
  };

  const getPictureSizeClasses = () => {
    switch (pictureSize) {
      case 'sm':
        return 'w-7 h-7';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 hover:opacity-80 transition-opacity ${className}`}
      title={`View ${user.username}'s profile`}
    >
      {showPicture && (
        <img
          src={getMediaUrl(user.profile_picture)}
          alt={user.username}
          className={`${getPictureSizeClasses()} rounded-full border border-gray-200 object-cover`}
        />
      )}
      {showUsername && (
        <span className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
          {user.username}
        </span>
      )}
      {children}
    </button>
  );
};

export default ProfileLink; 