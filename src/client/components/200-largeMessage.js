// @flow

import React from 'react';
import { LargeMessage } from 'giu';

const Message = (props: Object) => (
  <LargeMessage {...props} style={style.outer} />
);

const style = {
  outer: {
    fontFamily: 'sans-serif',
    fontWeight: 100,
  },
};

export default Message;
