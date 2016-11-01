// @flow

import React from 'react';
import { Link } from 'react-router';
import { Icon, hoverable, flexContainer, flexItem } from 'giu';

// ==========================================
// Component declarations
// ==========================================
type PropsT = {
  id: string,
  label: string,
  icon: string,
  link: string,
  fSelected: boolean,
  // hoverable HOC
  onHoverStart: Function,
  onHoverStop: Function,
  hovering: any,
};

// ==========================================
// Component
// ==========================================
const SidebarItem = ({
  id,
  label,
  icon,
  link,
  fSelected,
  hovering,
  onHoverStart,
  onHoverStop,
}: PropsT) => {
  const fHovered = hovering === id;
  return (
    <Link
      id={id}
      to={link}
      style={style.outer({ fSelected, fHovered })}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverStop}
    >
      <div style={flexItem('0 0 20px')}>
        <Icon icon={icon} />
      </div>
      <div style={flexItem(1)}>
        {label}
      </div>
    </Link>
  );
};

const SidebarGroup = ({ name, children }: {
  name: string,
  children?: any,
}) =>
  <div style={style.group}>
    <div style={style.groupTitle}>
      {name}
    </div>
    {children}
  </div>;

// ------------------------------------------
const style = {
  outer: ({ fSelected, fHovered }: {
    fSelected?: boolean,
    fHovered?: boolean,
  }) => {
    let backgroundColor;
    if (fSelected && fHovered) {
      backgroundColor = '#ba360a';
    } else if (fHovered) {
      backgroundColor = '#ddd';
    } else if (fSelected) {
      backgroundColor = '#ca461a';
    }
    return flexContainer('row', {
      padding: '0.3em 1em',
      cursor: 'pointer',
      color: fSelected ? 'white' : 'currentColor',
      backgroundColor,
      wordBreak: 'break-word',
      alignItems: 'center',
      textDecoration: 'none',
    });
  },
  group: {
    margin: '0.5em 0',
    padding: '0.3em 0',
    backgroundColor: 'white',
    // border: '1px solid #aaa',
  },
  groupTitle: {
    color: '#999',
    padding: '0.3em 1em',
    fontSize: '0.8em',
    textTransform: 'uppercase',
  },
};

// ==========================================
// Public API
// ==========================================
export default hoverable(SidebarItem);
export {
  SidebarItem as _SidebarItem,
  SidebarGroup,
};
