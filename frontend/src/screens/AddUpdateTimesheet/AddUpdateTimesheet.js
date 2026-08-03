import React, { Component } from 'react'
import AddTimesheet from '../../components/AddTimesheet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

export class AddUpdateTimesheet extends Component {
  constructor(props) {
    super(props);
    this.timesheet = props?.rowData
  }
  render() {
    return (
      <AddTimesheet
        timesheet={this.timesheet}
        profile={this.props.profile}
        setOpen={this.props.setOpen}
        addTimesheetToUser={this.props.addTimesheetToUser}
        setUpdateGrid={this.props.setUpdateGrid}
        updateGrid={this.props.updateGrid}
      />
    )
  }
}

const mapStateToProps = (props) => {
  return {
    profile: props.session?.user?.user
  }
}

export default connect(mapStateToProps)(withRouter(AddUpdateTimesheet));
