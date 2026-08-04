import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from '../screens/Login';
import Home from '../screens/Home';
import { AuthContext } from '../context/auth';
import UserList from '../screens/UserList';
import store from '../store';
import TimesheetListing from '../screens/TimesheetListing';
import ChangePasswordForm from '../screens/ChangePassword';
import PagenotFound from '../screens/PageNotFound';
import { connect } from 'react-redux';
import WorkListing from '../screens/WorkListing';
import ClientListing from '../screens/ClientListing';
import ProjectListing from '../screens/ProjectListing';
import TaskListing from '../screens/TaskListing';
import ViewReportScreen from '../screens/ViewReportScreen';
import Dashboard from '../components/Dashboard/Dashboard';
import Profile from '../screens/Profile/Profile';
import Birthdays from '../screens/Birthday/Birthdays';
import Leaves from '../screens/Leaves.js/Leaves';



class Navigation extends Component {
  constructor(props) {
    super(props);
    this.locations = props?.location
  }
  render() {
    if (!this.props.checked) {
      return <div>Loading...</div>; // Replace with your loading spinner or fallback UI
    }
    return (
      <AuthContext.Provider value={store}>
        <ToastContainer position="top-center" theme="colored" />
        {this.props.checked && (
          <div className='px-4'>
            <Switch>
              <Route
                exact
                path='/'
                render={(routeProps) =>
                  this.props.authenticated
                    ? <Dashboard {...routeProps} theme={this.props.theme} />
                    : <Login {...routeProps} />
                }
              />
              <Route exact path="/login" component={Login} />
              <Route exact path='/users' component={!this.props.authenticated ? Login : this.props?.profile?.role === 'ADMIN' ? UserList : Home} />
              <Route exact path='/change-password' component={this.props.authenticated ? ChangePasswordForm : Login} />
              <Route exact path='/timesheets' component={this.props.authenticated ? TimesheetListing : Login} />
              <Route exact path='/tasks' component={!this.props.authenticated ? Login : TaskListing} />
              <Route exact path='/home' component={!this.props.authenticated ? Login : this.props?.profile?.role === 'ADMIN' ? Home : Login} />
              <Route exact path='/works' component={!this.props.authenticated ? Login : (this.props?.profile?.role === 'ADMIN' || this.props?.profile?.role === 'TL' || this.props?.profile?.role === 'QA') ? WorkListing : Home} />
              <Route exact path='/clients' component={!this.props.authenticated ? Login : (this.props?.profile?.role === 'ADMIN' || this.props?.profile?.role === 'TL' || this.props?.profile?.role === 'QA') ? ClientListing : Home} />
              <Route exact path='/projects' component={!this.props.authenticated ? Login : (this.props?.profile?.role === 'ADMIN' || this.props?.profile?.role === 'TL' || this.props?.profile?.role === 'QA') ? ProjectListing : Home} />
              <Route exact path="/viewreport" component={!this.props.authenticated ? Login : this.props?.profile?.role === 'ADMIN' ? ViewReportScreen : Home} />
              <Route exact path='/profile'
                render={(routeProps) =>
                  this.props.authenticated
                    ? <Profile {...routeProps} theme={this.props.theme} />
                    : <Login {...routeProps} />
                }
              />
              <Route exact path="/birthdays"
                render={(routeProps) =>
                  this.props.authenticated
                    ? <Birthdays {...routeProps} theme={this.props.theme} />
                    : <Login {...routeProps} />
                }
              />
              <Route exact path="/leave"
                render={(routeProps) =>
                  this.props.authenticated
                    ? <Leaves {...routeProps} theme={this.props.theme} />
                    : <Login {...routeProps} />
                }
              />
              <Route exact path='*' component={PagenotFound} />
            </Switch>
          </div>

        )}
      </AuthContext.Provider>
    )
  }
}

const mapStateToProps = ({ session }) => {
  return {
    profile: session.user?.user,
    authenticated: session.authenticated,
    checked: session.checked
  }
}

export default connect(mapStateToProps)(Navigation);
