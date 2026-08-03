import React, { Component } from 'react'
import AddTask from '../../components/AddTask/AddTask';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

export class AddUpdateTask extends Component {
  constructor(props) {
    super(props);
    this.task = props?.rowData
    this.employees = props.employees
    this.qas = props.qas
    this.works = props.works
  }
  render() {
    return (
      <div >
        <AddTask task={this.task} employees={this.employees} qas={this.qas} works={this.works} profile={this.props.profile} setOpen={this.props.setOpen} setUpdateGrid={this.props.setUpdateGrid} updateGrid={this.props.updateGrid} />

      </div>
    )
  }
}

const mapStateToProps = (props) => {
  return {
    profile: props.session?.user?.user
  }
}

export default connect(mapStateToProps)(withRouter(AddUpdateTask));