// @flow

import React from 'react';
import Frame from 'react-frame-component';
import { flexItem } from 'giu';
import type { SnapshotT } from '../../common/types';
import LargeMessage from './200-largeMessage';

// ==========================================
// Component declarations
// ==========================================
type PropsT = {
  snapshot: ?SnapshotT,
};

// ==========================================
// Component
// ==========================================
const Preview = ({ snapshot }: PropsT) => {
  if (!snapshot) {
    return (
      <div style={style.outer}>
        <LargeMessage>No snapshot selected</LargeMessage>
      </div>
    );
  }
  if (!snapshot.html) {
    return (
      <div style={style.outer}>
        <pre style={style.outerNonHtml}>{snapshot.snap}</pre>
      </div>
    );
  }
  const css = (snapshot.css || []).join('\n');
  const contents = { __html: snapshot.html };
  /* eslint-disable react/no-danger */
  return (
    <Frame
      style={style.frame}
    >
      <style>{css}</style>
      <div dangerouslySetInnerHTML={contents} />
    </Frame>
  );
  /* eslint-enable react/no-danger */
};

// ------------------------------------------
const style = {
  outer: flexItem(1, {
    transform: 'translateZ(0)',  // isolate it!
  }),
  outerNonHtml: {
    margin: 0,
    padding: '0 1em',
  },
  frame: {
    border: 'none',
    width: '100%',
  },
};

// ==========================================
// Public API
// ==========================================
export default Preview;
