import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import {
  FiChevronRight,
  FiChevronLeft,
} from 'react-icons/fi';

const DraggableSidebar = ({
  children,
  title = 'Sidebar',
  defaultWidth = 300,
  defaultHeight = 300,
  minWidth = 280,
  minHeight = 200,
  maxWidth = 800,
  maxHeight = 600,
  initialPosition = 'right',
  defaultTab,
  onStateChange,
}) => {
  const [size, setSize] = useState({
    width: Math.min(Math.max(defaultWidth, minWidth), maxWidth),
    height: Math.min(Math.max(defaultHeight, minHeight), maxHeight),
  });
  const [position, setPosition] = useState(initialPosition);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);
  const _dragStartRef = useRef({ x: 0, y: 0 });

  // 标签页状态
  const tabs = useMemo(() =>
    React.Children.toArray(children).map((child) => ({
      label: child.props.label,
      content: child,
    })), [children]
  );
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.label);

  const COLLAPSE_THRESHOLD = 100;
  const COLLAPSED_SIZE = 40;
  const POSITION_SWITCH_THRESHOLD = 100;

  const _STYLES = {
    base: {
      transition: 'all 0.2s ease-out',
      background: 'var(--color-surface-card)',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      position: 'absolute',
      zIndex: 10,
    },
    // ...
  };

  useEffect(() => {
    onStateChange?.({
      isCollapsed,
      size,
      COLLAPSED_SIZE
    });
  }, [isCollapsed, size, onStateChange]);

  useEffect(() => {
    // Update size when default dimensions change
    setSize(_prev => ({
      width: Math.min(Math.max(defaultWidth, minWidth), maxWidth),
      height: Math.min(Math.max(defaultHeight, minHeight), maxHeight),
    }));
  }, [defaultWidth, defaultHeight, minWidth, minHeight, maxWidth, maxHeight]);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = isCollapsed ? minWidth : size.width;
    const startHeight = isCollapsed ? minHeight : size.height;

    const handleMouseMove = (e) => {
      if (position === 'right') {
        const deltaX = startX - e.clientX;
        const newWidth = startWidth + deltaX;

        if (newWidth < COLLAPSE_THRESHOLD) {
          setIsCollapsed(true);
          const newSize = { width: COLLAPSED_SIZE, height: size.height };
          setSize(newSize);
        } else {
          setIsCollapsed(false);
          const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
          const newSize = { width: clampedWidth, height: size.height };
          setSize(newSize);
        }
      } else {
        const deltaY = startY - e.clientY;
        const newHeight = startHeight + deltaY;

        const deltaX = e.clientX - startX;
        if (Math.abs(deltaX) > POSITION_SWITCH_THRESHOLD && !isDraggingPosition) {
          setIsDraggingPosition(true);
          setPosition('right');
          setSize({
            width: defaultWidth,
            height: window.innerHeight,
          });
          return;
        }

        if (newHeight < COLLAPSE_THRESHOLD) {
          setIsCollapsed(true);
          setSize((prev) => ({ ...prev, height: COLLAPSED_SIZE }));
        } else {
          setIsCollapsed(false);
          const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
          setSize((prev) => ({ ...prev, height: clampedHeight }));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDraggingPosition(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };

    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [
    isCollapsed, size, minWidth, minHeight, maxWidth, maxHeight,
    position, defaultWidth, COLLAPSE_THRESHOLD, POSITION_SWITCH_THRESHOLD, isDraggingPosition
  ]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const getStyle = () => {
    const baseStyle = {
      transition: isResizing ? 'none' : 'all 0.2s ease-out',
      background: 'transparent',
      position: 'absolute',
      zIndex: 10,
    };

    if (position === 'right') {
      return {
        ...baseStyle,
        top: 0,
        right: 0,
        width: isCollapsed ? COLLAPSED_SIZE : Math.min(Math.max(size.width, minWidth), maxWidth),
        height: '100%',
      };
    } else {
      return {
        ...baseStyle,
        bottom: 0,
        left: 0,
        width: '100vw',
        height: isCollapsed ? COLLAPSED_SIZE : Math.min(Math.max(size.height, minHeight), maxHeight),
      };
    }
  };

  const _Tab = memo(({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium text-sm transition-all relative
        ${isActive
          ? 'text-primary-600 dark:text-primary-400 bg-surface-card before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-primary-500'
          : 'text-content-secondary hover:text-primary-500 hover:bg-surface-card/50 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-transparent hover:before:bg-primary-200 dark:hover:before:bg-primary-800'
        }`}
    >
      {label}
    </button>
  ));

  return (
    <div style={getStyle()} className="flex bg-surface-bg">
      {/* Resize Handle */}
      <div
        className={`absolute ${
          position === 'right'
            ? 'left-0 top-0 w-4 h-full cursor-col-resize -ml-2 z-10'
            : 'top-0 left-0 w-full h-4 cursor-row-resize -mt-2 z-10'
        } group`}
        onMouseDown={handleResizeStart}
      >
        {/* Resize Line */}
        <div
          className={`absolute ${
            position === 'right'
              ? 'left-1/2 top-0 w-0.5 h-full -translate-x-1/2'
              : 'top-1/2 left-0 h-0.5 w-full -translate-y-1/2'
          } ${
            isResizing
              ? 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
              : 'bg-border-subtle group-hover:bg-primary-400'
          } transition-all duration-200`}
        />

        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className={`absolute ${
            position === 'right'
              ? '-left-3 top-1/2 -translate-y-1/2'
              : 'left-1/2 -translate-x-1/2 -top-3'
          } w-7 h-7
            bg-gradient-to-br from-surface-card/95 to-surface-card/90 backdrop-blur-xl
            border border-border-subtle hover:border-primary-300/50
            rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
            hover:shadow-[0_8px_16px_-4px_rgba(59,130,246,0.15)]
            flex items-center justify-center
            text-content-secondary hover:text-primary-500
            transform hover:-translate-y-0.5 active:scale-95
            transition-all duration-300 ease-out
            ${isResizing ? 'border-primary-400 shadow-lg' : ''}`}
          style={{
            transform: `${position === 'right' ? 'rotate(0deg)' : 'rotate(90deg)'}`,
          }}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <FiChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-surface-card/95 to-surface-card/90 backdrop-blur-xl">
        {!isCollapsed ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Header */}
            <div className="border-b border-border-subtle">
              <div className="flex bg-gradient-to-b from-surface-elevated/60 via-surface-elevated/40 to-surface-elevated/30
                             backdrop-blur-sm px-2 pt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`relative px-5 py-2.5 font-medium text-sm transition-all
                      ${activeTab === tab.label
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-content-secondary hover:text-primary-500'}
                      group mr-1`}
                  >
                    {/* Background highlight */}
                    <div
                      className={`absolute inset-0 rounded-t-xl transition-all duration-300
                        ${activeTab === tab.label
                          ? 'bg-gradient-to-b from-surface-card/80 to-surface-card/60 opacity-100'
                          : 'opacity-0 group-hover:opacity-100 bg-gradient-to-b from-surface-card/40 to-surface-card/20'
                        }`}
                    />

                    {/* Tab label */}
                    <span className="relative z-10 tracking-wide">
                      {tab.label}
                    </span>

                    {/* Active state decorations */}
                    {activeTab === tab.label && (
                      <>
                        {/* Primary underline */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5
                                    bg-gradient-to-r from-primary-500/80 via-primary-600 to-primary-500/80" />

                        {/* Glow effect */}
                        <div className="absolute -bottom-[1px] left-0 right-0 h-[3px]
                                    bg-gradient-to-r from-primary-400/30 via-primary-500/50 to-primary-400/30
                                    blur-[2px]" />

                        {/* Side glow */}
                        <div className="absolute bottom-0 left-0 top-0 w-[1px]
                                    bg-gradient-to-b from-transparent via-primary-400/20 to-primary-500/30" />
                        <div className="absolute bottom-0 right-0 top-0 w-[1px]
                                    bg-gradient-to-b from-transparent via-primary-400/20 to-primary-500/30" />
                      </>
                    )}

                    {/* Hover effect */}
                    <div className={`absolute inset-0 rounded-t-xl transition-all duration-300
                                 bg-gradient-to-t from-primary-50/0 to-primary-50/0
                                 group-hover:from-primary-50/20 dark:group-hover:from-primary-900/20
                                 group-hover:to-primary-50/5 dark:group-hover:to-primary-900/5
                                 ${activeTab === tab.label ? 'opacity-0' : ''}`} />

                    {/* Hover underline */}
                    <div className={`absolute bottom-0 left-2 right-2 h-0.5
                                 bg-gradient-to-r from-primary-400/0 via-primary-400/40 to-primary-400/0
                                 transition-opacity duration-300 scale-x-90
                                 ${activeTab === tab.label ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-surface-bg">
              <div className="h-full">
                {tabs.find((tab) => tab.label === activeTab)?.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-surface-card/60 to-surface-card/40 backdrop-blur-sm">
            <span
              className={`text-content-secondary font-medium tracking-wide select-none
                ${position === 'right' ? 'rotate-180' : ''}
                ${position === 'right' ? 'px-2' : 'py-2'}
                hover:text-primary-500 transition-colors duration-200`}
              style={{
                writingMode: position === 'right' ? 'vertical-rl' : 'horizontal-tb',
              }}
            >
              {title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const COLLAPSED_SIZE = 40;
export default DraggableSidebar;
