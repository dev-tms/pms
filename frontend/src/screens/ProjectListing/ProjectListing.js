import React, { Component } from 'react'
import '../TimesheetListing/style.scss';
import { connect } from 'react-redux';
import ProjectGrid from '../../components/ProjectGrid/ProjectGrid';
export class ProjectListing extends Component {
  render() {
    return (
            <ProjectGrid  profile={this.props.profile}/>
    )
  }
}

const mapStateToProps = (stat) => {
  return {
    profile: stat.session.user?.user
  }
}

export default connect(mapStateToProps)(ProjectListing);