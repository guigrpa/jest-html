// @flow

import React from 'react';
import Frame from 'react-frame-component';
import { flexItem } from 'giu';
import { MarkdownPreview } from 'react-marked-markdown';
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
// Poor man JSON/markdown detection
// ==========================================
export const isJSON = (str: string) =>
  str.match(/^"\{\\"[^"]+":/) || str.match(/^"\\?[\\[{\["]/);
export const isMarkdown = (str: string) => str.match(/^\s*"\s*(#+|---+)/);

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
    if (isJSON(snapshotData.snap)) {
      // double rainbow
      return (
        <div style={style.outer}>
          <pre style={style.outerNonHtml}>
            {JSON.stringify(JSON.parse(JSON.parse(snapshotData.snap)), null, 2)}
          </pre>
        </div>
      );
    } else if (isMarkdown(snapshotData.snap)) {
      return (
        <div style={style.outer}>
          <MarkdownPreview
            value={snapshotData.snap}
            markedOptions={{
              gfm: true,
              tables: true,
              breaks: false,
              pedantic: false,
              sanitize: true,
              smartLists: true,
              smartypants: false,
            }}
          />
        </div>
      );
    }
    return (
      <div style={style.outer}>
        <pre style={style.outerNonHtml}>{snapshotData.snap}</pre>
      </div>
    );
  }
  const css = (snapshot.css || []).join('\n');
  const contents = { __html: snapshotData.html };
  /* eslint-disable react/no-danger */
  return (
    <Frame style={style.frame}>
      <style>{css}</style>
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
