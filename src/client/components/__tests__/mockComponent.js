const React = require('react');

module.exports = (name) => (props) => (
  <div dataMockType={name} {...props}>{props.children || name}</div>
);
