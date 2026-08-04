import React, { Component } from "react";
import { connect } from "react-redux";
import UsefulLinksGrid from "../../components/UsefulLinksGrid/UsefulLinksGrid";

export class UsefulLinksListing extends Component {
  render() {
    return <UsefulLinksGrid profile={this.props.profile} />;
  }
}

const mapStateToProps = (stat) => {
  return {
    profile: stat.session.user?.user,
  };
};

export default connect(mapStateToProps)(UsefulLinksListing);
