// src/components/editeComponents/Icon.tsx
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

// Map of icons that we have as local SVG files
const LOCAL_ICONS: Record<string, string> = {
  'folder': '/img/icon/material-symbols/folder.svg',
  'folder_open': '/img/icon/material-symbols/folder_open.svg',
  'expand_more': '/img/icon/material-symbols/expand_more.svg',
  'chevron_right': '/img/icon/material-symbols/chevron_right.svg',
  'draft': '/img/icon/material-symbols/draft.svg',
  'description': '/img/icon/material-symbols/description.svg',
  'image': '/img/icon/material-symbols/image.svg',
  'table_chart': '/img/icon/material-symbols/table_chart.svg',
  'link': '/img/icon/material-symbols/link.svg',
  'calculate': '/img/icon/material-symbols/calculate.svg',
  'videocam': '/img/icon/material-symbols/videocam.svg',
  'mic': '/img/icon/material-symbols/mic.svg',
  'code': '/img/icon/material-symbols/code.svg',
  'format_quote': '/img/icon/material-symbols/format_quote.svg'
};

const Icon: React.FC<IconProps> = ({ name, className = '', style }) => {
  // Check if we have this icon as a local SVG
  if (LOCAL_ICONS[name]) {
    return (
      <img 
        src={LOCAL_ICONS[name]}
        alt={name}
        className={className}
        style={style}
      />
    );
  }

  // Fallback to Material Symbols for any other icons
  return (
    <span 
      className={`material-symbols-outlined ${className}`.trim()}
      style={style}
    >
      {name}
    </span>
  );
};

export default Icon;