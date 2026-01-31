import { FiUser } from 'react-icons/fi';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <div
      className={`rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
        />
      ) : name ? (
        <span className="font-medium">{getInitials(name)}</span>
      ) : (
        <FiUser className="text-current" />
      )}
    </div>
  );
};

export default Avatar;