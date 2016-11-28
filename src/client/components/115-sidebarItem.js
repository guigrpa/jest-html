// @flow

import React from 'react';
import { Link } from 'react-router';
import { Icon, hoverable, flexContainer, flexItem, darken, lighten } from 'giu';
import { UI } from '../gral/constants';

// ==========================================
// Component declarations
// ==========================================
type PropsT = {
  id: string,
  label: string,
  dirty?: boolean,
  deleted?: boolean,
  icon: string,
  link: string,
  fSelected: boolean,
  showBaseline?: () => any,
  hideBaseline?: () => any,
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
  dirty,
  deleted,
  icon,
  link,
  fSelected,
  showBaseline,
  hideBaseline,
  hovering,
  onHoverStart,
  onHoverStop,
}: PropsT) => {
  const fHovered = hovering === id;
  const elDirty = dirty && !deleted
    ? <DirtyIcon
        id={id}
        fSelected={fSelected}
        fCanHover={!!showBaseline}
        onHoverStart={showBaseline}
        onHoverStop={hideBaseline}
      />
    : null;
  return (
    <Link
      id={id}
      to={link}
      style={style.outer({ fSelected, fHovered, fDeleted: deleted })}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverStop}
    >
      <div style={flexItem('0 0 20px')}>
        <Icon icon={icon} />
      </div>
      <div style={flexItem(1)}>
        {label}{' '}{deleted && <i>(deleted)</i>}
      </div>
      <div style={flexItem('0 0 10px')}>
        {elDirty}
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

const DirtyIcon = hoverable(({ hovering, id, fSelected, fCanHover, onHoverStart, onHoverStop }) => {
  let tooltip = 'Modified since the last time jest-html was launched';
  if (hovering) {
    tooltip += '; press ESC to dismiss this tooltip';
  } else {
    tooltip += fCanHover
      ? '; select this snapshot and hover to see baseline'
      : '; click for more details on what changed';
  }
  return (
    <Icon
      id={id}
      icon="asterisk"
      onMouseEnter={fSelected && onHoverStart}
      onMouseLeave={fSelected && onHoverStop}
      style={style.dirtyIcon({ fSelected, fCanHover, fHovering: hovering })}
      title={tooltip}
    />
  );
});

// ------------------------------------------
const style = {
  outer: ({ fSelected, fHovered, fDeleted }: {
    fSelected?: boolean,
    fHovered?: boolean,
    fDeleted?: boolean,
  }) => {
    let backgroundColor;
    if (fSelected && fHovered) backgroundColor = darken(UI.color.accentBg, 10);
    else if (fHovered) backgroundColor = darken('white', 10);
    else if (fSelected) backgroundColor = UI.color.accentBg;
    let color = 'currentColor';
    if (fSelected && fDeleted) color = lighten(UI.color.accentBg, 25);
    else if (fDeleted) color = UI.color.textDim;
    else if (fSelected) color = UI.color.accentFg;
    return flexContainer('row', {
      padding: '0.3em 1em',
      cursor: 'pointer',
      color,
      backgroundColor,
      wordBreak: 'break-word',
      alignItems: 'center',
      textDecoration: 'none',
    });
  },
  dirtyIcon: ({ fSelected, fCanHover, fHovering }) => {
    let color;
    if (fSelected && fCanHover && fHovering) color = lighten(UI.color.accentBg, 25);
    else if (fSelected && fCanHover) color = UI.color.accentFg;
    else if (fSelected) color = lighten(UI.color.accentBg, 25);
    else if (fCanHover) color = UI.color.accentBg;
    else color = UI.color.textDim;
    return { color };
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
