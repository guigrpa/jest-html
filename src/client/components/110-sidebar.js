// @flow

import React from 'react';
import { Link } from 'react-router';
import { Icon, flexContainer, flexItem } from 'giu';

// ==========================================
// Component declarations
// ==========================================
type PropsT = {
  title: any,
  subtitle: ?string,
  linkBack: ?string,
  children?: any,
};

// ==========================================
// Component
// ==========================================
const Sidebar = ({
  title,
  subtitle,
  linkBack,
  children,
}: PropsT) => {
  return (
    <div style={style.outer}>
      <div style={style.titleBar}>
        <div style={flexItem('0 0 30px')}>
          <Link
            to={linkBack || '#'}
            style={style.back}
          >
            <Icon icon="chevron-left" size="lg" disabled={linkBack == null} />
          </Link>
        </div>
        <div style={style.title} title={subtitle}>
          {title}
        </div>
        <div style={flexItem('0 1 30px')} />
      </div>
      {children}
    </div>
  );
};

// ------------------------------------------
const style = {
  outer: flexItem('0 0 18em', {
    padding: '0.3em 0',
    backgroundColor: '#eee',
    fontFamily: 'sans-serif',
    fontSize: '0.8em',
    overflow: 'auto',
    borderRight: '2px solid #ddd',
  }),
  back: {
    margin: '0.3em',
    padding: '0.3em',
    color: 'currentColor',
  },
  titleBar: flexContainer('row', {
    alignItems: 'baseline',
    marginTop: '0.3em',
    marginBottom: '0.6em',
  }),
  title: flexItem(1, {
    textAlign: 'center',
    fontWeight: 'bold',
  }),
};

// ==========================================
// Public API
// ==========================================
export default Sidebar;