// import React, { useState } from 'react';
// import { Form, Button } from 'react-bootstrap';
// import './style.scss'
// import { changePassword } from '../../controller/auth/loginApis';
// import { connect } from 'react-redux';

// const ChangePasswordForm = (props) => {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Add password change logic here
//     if (newPassword !== confirmPassword) {
//       setErrorMessage('Passwords do not match');
//     } else {
//       // Call your password change API or function here
//       console.log('Old Password:', oldPassword);
//       console.log('New Password:', newPassword);
//       console.log('Confirm Password:', confirmPassword);
//       // Reset form fields
//       let response = await changePassword(props?.profile?.email, oldPassword, newPassword);
//     }
//   };

//   return (
//     <div className="change-password-container">


//       <Form onSubmit={handleSubmit} className='change-password-form'>
//       <h1>Change Password</h1>
//         <Form.Group controlId="oldPassword">
//           <Form.Label>Old Password</Form.Label>
//           <Form.Control
//             type="password"
//             placeholder="Enter old password"
//             value={oldPassword}
//             onChange={(e) => setOldPassword(e.target.value)}
//           />
//         </Form.Group>

//         <Form.Group controlId="newPassword">
//           <Form.Label>New Password</Form.Label>
//           <Form.Control
//             type="password"
//             placeholder="Enter new password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//           />
//         </Form.Group>

//         <Form.Group controlId="confirmPassword">
//           <Form.Label>Confirm New Password</Form.Label>
//           <Form.Control
//             type="password"
//             placeholder="Confirm new password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//           />
//         </Form.Group>
//         {errorMessage && <p className="text-danger">{errorMessage}</p>}

//         <div className="d-flex form-row align-items-center justify-content-center btn-wrapper">
//                 <div className="col-auto">
//         <Button variant="primary" type="submit">
//           Change Password
//         </Button>
//         </div>
//         </div>
//       </Form>
//     </div>
//   );
// };

// const mapStateToProps = ({ session }) => {
//   return {
//     profile: session.user?.user
//   }
// }

// export default connect(mapStateToProps)(ChangePasswordForm);

















import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { connect } from 'react-redux';
import { changePassword } from '../../controller/auth/loginApis';

const EMPTY_PASSWORDS = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const ChangePassword = (props) => {
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const updateValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.currentPassword || !values.newPassword || !values.confirmPassword) {
      setMessageType('error');
      setMessage('Please fill all password fields.');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      setMessageType('error');
      setMessage('New password and confirm password must match.');
      return;
    }

    let response = await changePassword(props?.profile?.email, values.currentPassword, values.newPassword);
    if(response?.errors){
      setMessageType('error');
      setMessage(response.errors[0]);
      return;
    } else {
      setMessageType('success');
      setMessage('Password updated successfully.');
      setValues(EMPTY_PASSWORDS);
    }
  };

  return (
    <section className=" py-4 md:py-6 lg:py-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_26%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(2,6,23,0.98))] p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80">Security</p>
            <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Change Password</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Keep your account secure by using a strong password with a mix of letters, numbers, and symbols.
            </p>
          </div>
          <Link
            to="/profile"
            className=" w-[200px] inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Back to Profile
          </Link>
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-700/70 bg-slate-950/45 p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-500/12 p-2 text-sky-200">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Password Details</h2>
              <p className="mt-1 text-sm text-slate-400">Update your login password safely.</p>
            </div>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {[
              ['Current Password', 'currentPassword'],
              ['New Password', 'newPassword'],
              ['Confirm New Password', 'confirmPassword'],
            ].map(([label, field]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm text-slate-300">{label}</span>
                <input
                  type="password"
                  value={values[field]}
                  onChange={(event) => updateValue(field, event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
                />
              </label>
            ))}

            {message ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${messageType === 'error'
                  ? 'border border-rose-800/40 bg-rose-950/20 text-rose-300'
                  : 'border border-emerald-800/40 bg-emerald-950/20 text-emerald-300'
                  }`}
              >
                {message}
              </div>
            ) : null}

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/profile"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                <ShieldCheck size={16} />
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};



const mapStateToProps = ({ session }) => {
  return {
    profile: session.user?.user
  }
}

export default connect(mapStateToProps)(ChangePassword);
