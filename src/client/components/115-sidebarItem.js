// @flow

/* eslint-env browser */
import React from 'react';
import { Link } from 'react-router';
import {
  Icon,
  hoverable,
  flexContainer,
  flexItem,
  darken,
  lighten,
  isHintShown,
  hintDefine,
  hintShow,
} from 'giu';
import { UI } from '../gral/constants';
import { isWaiting } from '../gral/helpers';

let fHintAlreadyShown = false;

// ==========================================
// Component declarations
// ==========================================
type Props = {
  id: string,
  label: string,
  dirty?: boolean,
  deleted?: boolean,
  icon: string,
  link: string,
  fSelected: boolean,
  showBaseline?: () => any,
  hideBaseline?: () => any,
  saveAsBaseline?: (snapshotId: string) => any,
  // hoverable HOC
  hovering: any,
  onHoverStart: Function,
  onHoverStop: Function,
};

// ==========================================
// Component
// ==========================================
class SidebarItem extends React.Component {
  props: Props;
  fDirtyIconShown: boolean;

  componentDidMount() {
    this.hintIfNeeded();
  }
  componentDidUpdate() {
    this.hintIfNeeded();
  }

  // ------------------------------------------
  render() {
    const { id, deleted, fSelected } = this.props;
    const fHovered = this.props.hovering === id;
    return (
      <Link
        id={id}
        to={this.props.link}
        style={style.outer({ fSelected, fHovered, fDeleted: deleted })}
        onMouseEnter={this.props.onHoverStart}
        onMouseLeave={this.props.onHoverStop}
      >
        <div style={flexItem('0 0 20px')}>
          <Icon icon={this.props.icon} />
        </div>
        <div style={flexItem(1)}>
          {this.props.label} {deleted && <i>(deleted)</i>}
        </div>
        {this.renderDirtyIcon()}
      </Link>
    );
  }

  renderDirtyIcon() {
    this.fDirtyIconShown = Boolean(this.props.dirty) && !this.props.deleted;
    if (!this.fDirtyIconShown) return null;
    const { saveAsBaseline, showBaseline, hideBaseline } = this.props;
    return (
      <div
        className="jh-dirty-icon"
        style={flexItem('0 0 15px', { textAlign: 'right' })}
      >
        <DirtyIcon
          id={this.props.id}
          fSelected={this.props.fSelected}
          fSnapshot={!!showBaseline}
          onHoverStart={showBaseline}
          onHoverStop={hideBaseline}
          onClick={ev => {
            saveAsBaseline && saveAsBaseline(ev.target.id);
            hideBaseline && hideBaseline();
          }}
        />
      </div>
    );
  }

  // ------------------------------------------
  hintIfNeeded() {
    if (!this.fDirtyIconShown) return;
    if (fHintAlreadyShown || isHintShown() || isWaiting()) return;
    const elements = () => {
      const out = [];
      const node = document.getElementsByClassName('jh-dirty-icon')[0];
      if (node) {
        const bcr = node.getBoundingClientRect();
        const x = bcr.left + bcr.width + 70;
        const y = bcr.top + bcr.height / 2;
        out.push({
          type: 'LABEL',
          x,
          y,
          align: 'left',
          children: (
            <span>
              Changed! <span style={style.highlight}>In snapshots,</span> hover
              to see the baseline (old) version, and click to accept as a new
              baseline
            </span>
          ),
        });
        out.push({
          type: 'ARROW',
          from: { x, y },
          to: { x: x - 70 + 5, y },
          counterclockwise: true,
        });
      }
      return out;
    };
    hintDefine('dirtyIcon', { elements });
    hintShow('dirtyIcon');
    fHintAlreadyShown = true;
  }
}

const SidebarGroup = ({ name, children }: { name: string, children?: any }) =>
  <div style={style.group}>
    <div style={style.groupTitle}>
      {name}
    </div>
    {children}
  </div>;

const DirtyIcon = hoverable(
  ({
    hovering,
    id,
    fSelected,
    fSnapshot,
    onHoverStart,
    onHoverStop,
    onClick,
  }) => {
    let tooltip = 'Modified since the last time jest-html was launched';
    if (hovering) {
      tooltip += '. Click to save baseline. Press ESC to dismiss this tooltip';
    } else {
      tooltip += fSnapshot
        ? '. Select this snapshot and hover to see baseline'
        : '. Click for more details on what changed';
    }
    return (
      <Icon
        id={id}
        icon="asterisk"
        onMouseEnter={fSelected && onHoverStart}
        onMouseLeave={fSelected && onHoverStop}
        onClick={fSnapshot && onClick}
        style={style.dirtyIcon({ fSelected, fSnapshot, fHovering: hovering })}
        title={tooltip}
      />
    );
  }
);

// ------------------------------------------
const style = {
  outer: ({
    fSelected,
    fHovered,
    fDeleted,
  }: {
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
  dirtyIcon: ({ fSelected, fSnapshot, fHovering }) => {
    let color;
    if (fSelected && fSnapshot && fHovering)
      color = lighten(UI.color.accentBg, 25);
    else if (fSelected && fSnapshot) color = UI.color.accentFg;
    else if (fSelected) color = lighten(UI.color.accentBg, 25);
    else if (fSnapshot) color = UI.color.accentBg;
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
  highlight: {
    fontWeight: 'bold',
    color: 'yellow',
  },
};

// ==========================================
// Public API
// ==========================================
export default hoverable(SidebarItem);
export { SidebarItem as _SidebarItem, SidebarGroup };
