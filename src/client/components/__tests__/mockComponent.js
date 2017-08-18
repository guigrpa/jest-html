const React = require('react');

module.exports = name => props =>
  <div dataMockType={name} {...props}>
    <div style={{ fontWeight: 'bold', color: 'blue' }}>
      {name}
    </div>
    {props.children}
  </div>;

// const renderProps = (props) => {
//   if (!props) return null;
//   const out = [];
//   Object.keys(props).forEach((key) => {
//     if (key === 'children') return;
//     out.push(<div key={key}>{key} = {props[key]}</div>);
//   });
//   return out;
// };
