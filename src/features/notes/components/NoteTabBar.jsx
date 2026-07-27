export default function NoteTabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="bg-surface-card/30 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-3">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-5 py-3.5 font-medium transition-all relative
                ${activeTab === tab
                  ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-hover'}
                rounded-t-lg
                ${activeTab === tab &&
                  'after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 ' +
                  'after:bg-gradient-to-r after:from-blue-500 after:to-blue-600 ' +
                  'after:rounded-full after:shadow-sm'}`}
              onClick={() => onTabChange(tab)}
            >
              <span className="relative">
                {tab}
                {activeTab === tab && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px
                               bg-gradient-to-r from-blue-500/50 to-blue-600/50
                               blur-sm" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
