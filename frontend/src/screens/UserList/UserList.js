import React, { Component } from 'react';
import './style.css';
import DataGridTable from '../../components/DataGridTable/DataGridTable';
import { connect } from 'react-redux';
export class UserList extends Component {
  
  render() {
    return (
      <DataGridTable profile={this.props.profile}/>
    )
  }
} 

const mapStateToProps = (stat) => {
  return {
    profile: stat.session.user?.user
  }
}

export default connect(mapStateToProps)(UserList);