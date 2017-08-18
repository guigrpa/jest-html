/* eslint-env jest */
/* eslint-disable global-require, import/newline-after-import */
import React from 'react';
import renderer from 'react-test-renderer';
import LargeMessage from '../200-largeMessage';

// https://github.com/facebook/react/issues/7386#issuecomment-238091398
jest.mock('react-dom');

describe('LargeMessage', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <LargeMessage>
          An error has occurred:<br />
          Undefined is not a function!
        </LargeMessage>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
