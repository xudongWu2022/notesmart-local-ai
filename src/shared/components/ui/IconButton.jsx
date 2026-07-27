import React from 'react';

const IconButton = ({
  onClick,
  isActive,
  activeStyles,
  inactiveStyles,
  title,
  Icon,
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isActive ? activeStyles : inactiveStyles
      }`}
      title={title}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
};

export default IconButton;
