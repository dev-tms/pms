import React, { Component } from 'react'
import '../TimesheetListing/style.scss';
import ClientGrid from '../../components/ClientGrid/ClientGrid';
import { connect } from 'react-redux';

export class ClientListing extends Component {
  render() {
    return (
          <ClientGrid profile={this.props.profile} />
    )
  }
}

const mapStateToProps = (stat) => {
  return {
    profile: stat.session.user?.user
  }
}

export default connect(mapStateToProps)(ClientListing);