import React, { Component } from 'react'
import '../TimesheetListing/style.scss';
import WorkGrid from '../../components/WorkGrid/WorkGrid';
import { connect } from 'react-redux';
export class WorkListing extends Component {
  render() {
    return (
      <div >
        <WorkGrid profile={this.props.profile} />
      </div>
    )
  }
}

const mapStateToProps = (stat) => {
  return {
    profile: stat.session.user?.user
  }
}

export default connect(mapStateToProps)(WorkListing);