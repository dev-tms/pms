import React, { Component } from 'react'
import '../TimesheetListing/style.scss';
import { connect } from 'react-redux';
import TaskGrid from '../../components/TaskGrid/TaskGrid';

export class TaskListing extends Component {
  render() {
    return (
      <TaskGrid profile={this.props.profile} />
    )
  }
}
const mapStateToProps = (stat) => {
  return {
    profile: stat.session.user?.user
  }
}

export default connect(mapStateToProps)(TaskListing);