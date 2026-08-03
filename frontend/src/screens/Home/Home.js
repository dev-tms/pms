import React, { Component } from 'react';
import { connect } from 'react-redux';
import TimesheetGrid from '../../components/TimesheetGrid/TimesheetGrid';

export class Home extends Component {
  render() {
    return (
      <div >
          <TimesheetGrid profile={this.props.profile} />
       
      </div>
    )
  }
  
}

const mapStateToProps = ({session}) => {
  return {
    profile: session.user?.user,
    user: session.user
  }
}

export default connect(mapStateToProps)(Home);
