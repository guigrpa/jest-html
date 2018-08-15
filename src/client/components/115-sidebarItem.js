// @flow

/* eslint-env browser */
/* eslint-disable react/no-multi-comp, react/prefer-stateless-function */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Icon,
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
// SidebarItem
// ==========================================
type Props = {
  id: string,
  label: string,
  dirty?: boolean,
  deleted?: boolean,
  icon: string,
  link: any,
  fSelected: boolean,
  showBaseline?: () => any,
  hideBaseline?: () => any,
  saveAsBaseline?: (snapshotId: string) => any,
  // unit testing
  _hovering?: string,
};
type State = { hovering: ?string };

class SidebarItem extends React.Component<Props, State> {
  fDirtyIconShown: boolean;

  constructor(props: Props) {
    super(props);
    this.state = { hovering: props._hovering || null };
  }

  componentDidMount() {
    this.hintIfNeeded();
  }
  componentDidUpdate() {
    this.hintIfNeeded();
  }

  // ------------------------------------------
  render() {
    const { id, deleted, fSelected } = this.props;
    const isHovered = this.state.hovering === id;
    return (
      <Link
        id={id}
        to={this.props.link}
        style={style.outer({ fSelected, isHovered, isDeleted: deleted })}
        onMouseEnter={() => {
          this.setState({ hovering: id });
        }}
        onMouseLeave={() => {
          this.setState({ hovering: null });
        }}
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

const SidebarGroup = ({ name, children }: { name: string, children?: any }) => (
  <div style={style.group}>
    <div style={style.groupTitle}>{name}</div>
    {children}
  </div>
);

// ==========================================
// DirtyIcon
// ==========================================
type PropsDirtyIcon = {
  id: string,
  fSelected: boolean,
  fSnapshot: boolean,
  onClick: Function,
};
type StateDirtyIcon = { hovering: boolean };

class DirtyIcon extends React.Component<PropsDirtyIcon, StateDirtyIcon> {
  state = { hovering: false };

  // ------------------------------------------
  render() {
    const { id, fSelected, fSnapshot, onClick } = this.props;
    const { hovering } = this.state;
    const tooltip = ['Modified since the last time jest-html was launched'];
    if (hovering) {
      tooltip.push('Click to save baseline. Press ESC to dismiss this tooltip');
    } else {
      tooltip.push(
        fSnapshot
          ? 'Select this snapshot and hover to see baseline'
          : 'Click for more details on what changed'
      );
    }
    return (
      <Icon
        id={id}
        icon="asterisk"
        onMouseEnter={fSelected ? this.onHoverStart : undefined}
        onMouseLeave={fSelected ? this.onHoverStop : undefined}
        onClick={fSnapshot ? onClick : undefined}
        style={style.dirtyIcon({ fSelected, fSnapshot, fHovering: !!hovering })}
        title={tooltip.join('. ')}
      />
    );
  }

  // ------------------------------------------
  onHoverStart = () => {
    this.setState({ hovering: true });
  };

  onHoverStop = () => {
    this.setState({ hovering: false });
  };
}

// ------------------------------------------
const style = {
  outer: ({
    fSelected,
    isHovered,
    isDeleted,
  }: {
    fSelected?: boolean,
    isHovered?: boolean,
    isDeleted?: boolean,
  }) => {
    let backgroundColor;
    if (fSelected && isHovered) backgroundColor = darken(UI.color.accentBg, 10);
    else if (isHovered) backgroundColor = darken('white', 10);
    else if (fSelected) backgroundColor = UI.color.accentBg;
    let color = 'currentColor';
    if (fSelected && isDeleted) color = lighten(UI.color.accentBg, 25);
    else if (isDeleted) color = UI.color.textDim;
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
// Public
// ==========================================
export default SidebarItem;
export { SidebarItem as _SidebarItem, SidebarGroup };
