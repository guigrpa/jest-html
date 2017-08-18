// @flow

import React from 'react';
import Frame from 'react-frame-component';
import { flexItem } from 'giu';
import type { SnapshotT } from '../../common/types';
import LargeMessage from './200-largeMessage';

// ==========================================
// Declarations
// ==========================================
type PropsT = {
  snapshot: ?SnapshotT,
  fRaw?: boolean,
  fShowBaseline?: boolean,
};

// ==========================================
// Component
// ==========================================
const Preview = ({ snapshot, fRaw, fShowBaseline }: PropsT) => {
  if (!snapshot) {
    return (
      <div style={style.outer}>
        <LargeMessage>No snapshot selected</LargeMessage>
      </div>
    );
  }
  const snapshotData =
    fShowBaseline && snapshot.baseline ? snapshot.baseline : snapshot;
  if (fRaw || !snapshotData.html) {
    return (
      <div style={style.outer}>
        <pre style={style.outerNonHtml}>
          {snapshotData.snap}
        </pre>
      </div>
    );
  }
  const css = (snapshot.css || []).join('\n');
  const contents = { __html: snapshotData.html };
  /* eslint-disable react/no-danger */
  return (
    <Frame style={style.frame}>
      <style>
        {css}
      </style>
      <div dangerouslySetInnerHTML={contents} />
    </Frame>
  );
  /* eslint-enable react/no-danger */
};

// ------------------------------------------
const style = {
  outer: flexItem(1, {
    transform: 'translateZ(0)', // isolate it!
    maxHeight: '100vh',
    overflow: 'auto',
  }),
  outerNonHtml: {
    margin: 0,
    padding: '0 1em',
  },
  frame: {
    border: 'none',
    width: '100%',
    maxHeight: '100vh',
    overflow: 'auto',
  },
};

// ==========================================
// Public
// ==========================================
export default Preview;
