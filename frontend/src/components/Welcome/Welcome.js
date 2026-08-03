import React, { Component } from 'react';
import { connect } from 'react-redux';
import './style.css';

export class Welcome extends Component {
  render() {
    return (
      <div className="marquee1"><p>Welcome {this.props.user?.name} !</p></div>
    )
  }
}


const mapStateToProps = ({ session }) => {
  return {
    user: session.user?.user
  }
}

export default connect(mapStateToProps)(Welcome);
