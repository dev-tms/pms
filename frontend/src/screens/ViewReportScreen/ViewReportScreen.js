import React, { Component } from 'react'
import '../TimesheetListing/style.scss';
import { connect } from 'react-redux';
import ViewReport from '../../components/ViewReport/ViewReport';
export class ViewReportScreen extends Component {
  render() {
    return (
      <div >
        <ViewReport profile={this.props.profile} />
      </div>
    )
  }
}

const mapStateToProps = (stat) => {
  return {
    profile: stat.session.user?.user
  }
}

export default connect(mapStateToProps)(ViewReportScreen);