import React, { useState } from 'react';

const DEFAULT_SECTIONS = [
    { id: 'features', label: 'Features' },
    { id: 'tech_stack', label: 'Tech Stack' },
    { id: 'installation', label: 'Installation & Setup' },
    { id: 'usage', label: 'Usage Guide' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'deployment', label: 'Deployment' },
    { id: 'contributing', label: 'Contributing & License' }
];

export default function SectionOrder({ sectionOrder, setSectionOrder, disabled }) {
    const [draggedItem, setDraggedItem] = useState(null);

    // Initialize if empty
    React.useEffect(() => {
        if (!sectionOrder || sectionOrder.length === 0) {
            setSectionOrder(DEFAULT_SECTIONS.map(s => s.id));
        }
    }, [sectionOrder, setSectionOrder]);

    const handleDragStart = (e, index) => {
        if (disabled) return;
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
        // Small delay to allow the drag image to generate before adding styles
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
        setDraggedItem(null);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (disabled || draggedItem === null || draggedItem === index) return;

        const newOrder = [...sectionOrder];
        const draggedId = newOrder[draggedItem];

        // Remove the dragged item
        newOrder.splice(draggedItem, 1);
        // Insert it at the new position
        newOrder.splice(index, 0, draggedId);

        setSectionOrder(newOrder);
        setDraggedItem(index);
    };

    const currentSections = sectionOrder?.length > 0
        ? sectionOrder.map(id => DEFAULT_SECTIONS.find(s => s.id === id) || { id, label: id })
        : DEFAULT_SECTIONS;

    return (
        <div className="form-group section-order-container">
            <label>README Section Order</label>
            <small style={{ display: 'block', marginBottom: '8px' }}>Drag and drop to rearrange the sections in your generated README.</small>
            <div
                className="section-list"
                style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-input)',
                    padding: '0.5rem',
                    opacity: disabled ? 0.6 : 1,
                    pointerEvents: disabled ? 'none' : 'auto'
                }}
            >
                {currentSections.map((section, index) => (
                    <div
                        key={section.id}
                        draggable={!disabled}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        style={{
                            padding: '0.75rem 1rem',
                            margin: '0.25rem 0',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: disabled ? 'not-allowed' : 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'transform 0.1s ease',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        <span style={{ marginRight: '12px', color: 'var(--text-secondary)' }}>↕️</span>
                        {section.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
