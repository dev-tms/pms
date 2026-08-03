import React, { Component } from 'react'
import { ProfileImage } from '../../components';
import AddWork from '../../components/AddWork';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

export class AddUpdateWork extends Component {
  constructor(props) {
    super(props);
    this.work = props?.rowData
  }
  render() {
    return (
      <div>
          <AddWork work={this.work} profile={this.props.profile} setOpen={this.props.setOpen}  setUpdateGrid={this.props.setUpdateGrid} updateGrid = {this.props.updateGrid}/>
        
      </div>
    )
  }
}

const mapStateToProps = (props) => {
  return {
    profile: props.session?.user?.user
  }
}

export default connect(mapStateToProps)(withRouter(AddUpdateWork));