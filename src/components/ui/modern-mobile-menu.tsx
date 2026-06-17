import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Home, Briefcase, Calendar, Shield, Settings, Info, Award, MessageSquare, Bell } from 'lucide-react';

type IconComponentType = React.ElementType<{ className?: string }>;
export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  id?: string;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  activeIndex?: number;
  onChange?: (index: number) => void;
}

const defaultItems: InteractiveMenuItem[] = [
    { label: 'home', icon: Home, id: 'home' },
    { label: 'strategy', icon: Briefcase, id: 'strategy' },
    { label: 'period', icon: Calendar, id: 'period' },
    { label: 'security', icon: Shield, id: 'security' },
    { label: 'settings', icon: Settings, id: 'settings' },
];

const defaultAccentColor = 'var(--component-active-color-default)';

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ 
  items, 
  accentColor, 
  activeIndex: activeIndexProp, 
  onChange 
}) => {

  const finalItems = useMemo(() => {
     // Allow up to 9 items to support full header navigation links gracefully
     const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 9;
     if (!isValid) {
        console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", items);
        return defaultItems;
     }
     return items;
  }, [items]);

  const [localActiveIndex, setLocalActiveIndex] = useState(0);
  const activeIndex = activeIndexProp !== undefined ? activeIndexProp : localActiveIndex;

  useEffect(() => {
      if (activeIndex >= finalItems.length) {
          if (onChange) {
            onChange(0);
          } else {
            setLocalActiveIndex(0);
          }
      }
  }, [finalItems, activeIndex, onChange]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();

    // Small delay to ensure text ref offsets are measured correctly after rendering
    const timer = setTimeout(setLineWidth, 50);

    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
      clearTimeout(timer);
    };
  }, [activeIndex, finalItems]);

  const handleItemClick = (index: number) => {
    if (onChange) {
      onChange(index);
    } else {
      setLocalActiveIndex(index);
    }
  };

  const navStyle = useMemo(() => {
      const activeColor = accentColor || defaultAccentColor;
      return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]); 

  return (
    <nav
      className="menu"
      role="navigation"
      style={navStyle}
    >
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex;
        const isTextActive = isActive;

        const IconComponent = item.icon;

        return (
          <button
            key={item.label}
            className={`menu__item ${isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
            ref={(el) => (itemRefs.current[index] = el)}
            style={{ '--lineWidth': '0px' } as React.CSSProperties} 
          >
            <div className="menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`menu__text ${isTextActive ? 'active' : ''}`}
              ref={(el) => (textRefs.current[index] = el)}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu };
