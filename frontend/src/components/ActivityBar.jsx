import React from 'react'

export default function ActivityBar({
  activeTab,
  onTabChange,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenShortcuts,
  onOpenSettings
}) {
  const tabs = [
    {
      id: 'explorer',
      label: 'Explorer (Ctrl+Shift+E)',
      icon: 'folder_open',
      badge: null
    },
    {
      id: 'generator',
      label: 'Documentation Config (Ctrl+Shift+G)',
      icon: 'tune',
      hasDot: false
    },
    {
      id: 'outline',
      label: 'Document Outline (TOC)',
      icon: 'toc',
      badge: null
    },
    {
      id: 'templates',
      label: 'Starter Presets & Templates',
      icon: 'bookmark_border',
      badge: null
    },
    {
      id: 'tools',
      label: 'Studio Tools & Builders (Badges, Diagrams, Tables, Snippets)',
      icon: 'auto_fix_high',
      badge: null
    }
  ]

  const handleTabClick = (tabId) => {
    if (activeTab === tabId) {
      // Toggle sidebar if clicking the already active tab
      onToggleSidebar()
    } else {
      // Switch tab and always open sidebar
      onTabChange(tabId)
    }
  }

  return (
    <aside className="activity-bar select-none">
      {/* Top Cluster */}
      <div className="activity-bar-top">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id && !sidebarCollapsed
          return (
            <button
              key={tab.id}
              type="button"
              className={`activity-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
            >
              <span
                className="material-symbols-outlined activity-icon"
                style={tab.id === 'generator' && isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              {tab.hasDot && (
                <span className="activity-beacon" title="AI Assistant Available"></span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom Pinned Cluster */}
      <div className="activity-bar-bottom">
        <button
          type="button"
          className="activity-tab-btn"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts Cheat Sheet (Ctrl+/)"
        >
          <span className="material-symbols-outlined activity-icon">keyboard</span>
        </button>

        <button
          type="button"
          className="activity-tab-btn"
          onClick={onOpenSettings}
          title="Studio Settings & Formatting Options"
        >
          <span className="material-symbols-outlined activity-icon">settings</span>
        </button>
      </div>
    </aside>
  )
}
