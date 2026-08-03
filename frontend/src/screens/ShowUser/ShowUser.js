import React, { Component } from 'react';
import './style.scss';
import UserDetails from '../../components/UserDetails/UserDetails';
export class ShowUser extends Component {
  constructor(props) {
    super(props);
    this.contact = props?.rowData;
  }
  render() {
    return (
      <div>
        <UserDetails contact={this.contact} />
      </div>
    )
  }
}

export default ShowUser;