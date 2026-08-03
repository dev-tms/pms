import { Eye, EyeOff, Mail } from 'lucide-react';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { login } from '../../controller/auth/loginApis';
import { sessionService } from 'redux-react-session';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import toastMessages from '../../utils/ToastMassages';
import InputField from '../../components/InputField/InputField';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      errors: {
        username: 'Enter User Name!',
        password: 'Enter Password!',
      },
      loginStatus: '',
      submitted: false,
      showPassword: false,
      keepLoggedIn: false,
    };
  }

  inputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
    this.validationErrorMessage(event);
  };

  validationErrorMessage = (event) => {
    const { name, value } = event.target;
    let errors = this.state.errors;
    switch (name) {
      case 'username':
        errors.username = value.length < 1 ? 'Enter User Name' : '';
        break;
      case 'password':
        errors.password = value.length < 1 ? 'Enter Password' : '';
        break;
      default:
        break;
    }
    this.setState({ errors });
  };

  validateForm = (errors) => {
    let valid = true;
    Object.entries(errors).forEach((item) => {
      item && item[1].length > 0 && (valid = false);
    });
    return valid;
  };

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({ showPassword: !prevState.showPassword }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ submitted: true });

    const { username, password } = this.state;

    if (!username.trim() || !password.trim()) {
      toast.error(toastMessages.fillAllFields);
      return;
    }

    if (this.validateForm(this.state.errors)) {
      const user = await login(this.state);
      if (user && user.user) {
        sessionService
          .saveSession(user.accessToken)
          .then(() => {
            sessionService
              .saveUser(user)
              .then(() => {
                toast.success(toastMessages.loginSuccess);
                sessionService.loadUser().then((response) => {
                  // console.log('Login user', response);
                  this.props.history.push('/');
                });
              })
              .catch((err) => console.error(err));
          })
          .catch((err) => console.error(err));
      } else {
        this.setState({ loginStatus: 'Login Failed! Invalid Username and Password' });
        toast.error(toastMessages.loginError);
      }
    }
  };

  render() {
    const { username, password, errors, submitted, showPassword } = this.state;

    return (
      <>
        <ToastContainer position="top-center" theme="colored" />

        <div className="login flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
          <div className="app-header-bg space-y-4 max-w-[550px] w-full mx-auto mt-4 rounded-2xl border border-slate-800 p-6 py-7 md:py-10">

            <h1 className="text-3xl font-extrabold text-center md:text-4xl">
              Login
            </h1>

            <form onSubmit={this.handleSubmit}>

              {/* Email */}
              <InputField
                label="Email"
                type="email"
                name="username"
                placeholder="Enter Email"
                icon={Mail}
                value={username}
                onChange={(e) =>
                  this.inputChange({ target: { name: 'username', value: e.target.value } })
                }
              />
              {submitted && errors.username.length > 0 && (
                <p className="text-red-500 text-sm -mt-2 mb-2 pl-1">{errors.username}</p>
              )}

              {/* Password */}
              <InputField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter Password"
                icon={showPassword ? EyeOff : Eye}
                iconOnClick={this.togglePasswordVisibility}
                value={password}
                onChange={(e) =>
                  this.inputChange({ target: { name: 'password', value: e.target.value } })
                }
              />
              {submitted && errors.password.length > 0 && (
                <p className="text-red-500 text-sm -mt-2 mb-2 pl-1">{errors.password}</p>
              )}

              {/* Submit Button — original structure preserved exactly */}
              <div className="relative group mt-6">
                    <button
                      type="submit"
                      name="text"
                      className="w-full smky-btn3 relative hover:text-[#000] py-2 px-6 after:absolute after:h-1 after:hover:h-[200%] transition-all duration-500 hover:transition-all hover:duration-500 after:transition-all after:duration-500 after:hover:transition-all after:hover:duration-500 overflow-hidden z-20 after:z-[-20] after:bg-[#abd373] after:rounded-t-sm after:w-full after:bottom-0 after:left-0 h-[50px]"
                    >
                      Submit
                    </button>
                {/* <div className="relative h-14 opacity-90 overflow-hidden rounded-xl bg-black z-10 w-full">
                  <div className="absolute z-10 -translate-x-44 h-full w-44 -skew-x-12 bg-gradient-to-r from-gray-500 to-white/10 opacity-30 transition-all duration-700 ease-in group-hover:translate-x-[30rem]" />
                  <div className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-2xl inset-0.5 bg-black">
                  </div>
                  <div className="absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-white to-slate-600 blur-[30px]" />
                </div> */}
              </div>

            </form>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = ({ session }) => ({
  profile: session.user?.user,
});

export default connect(mapStateToProps)(withRouter(Login));