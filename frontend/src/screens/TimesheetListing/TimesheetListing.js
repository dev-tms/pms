import React, { Component } from 'react'
import TimesheetGrid from '../../components/TimesheetGrid/TimesheetGrid'
import { connect } from 'react-redux';

export class TimesheetListing extends Component {
  render() {
    return this.props?.profile?.id ? (
          <TimesheetGrid profile={this.props.profile} />
    ) : null
  }
}
const mapStateToProps = (stat) => {
  return {
    profile: stat.session.user?.user
  }
}

export default connect(mapStateToProps)(TimesheetListing);
