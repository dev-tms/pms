import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Sparkles,
} from 'lucide-react';
import { connect } from 'react-redux';
import { getProfile, register } from '../../controller/auth/loginApis';
import { toast } from 'react-toastify';
import toastMessages from '../../utils/ToastMassages';
import { dateMax, dateMin } from '../../utils';

const formatBirthDate = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const Profile = ({ profile, theme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [userProfile, setUserProfile] = useState(profile);
  const [reloadProfile, setReloadProfile] = useState(false);
  useEffect(() => {
    async function fetchProfile() {
      if (profile) {
        const profileData = await getProfile(profile);
        if (profileData) {
          const normalizedProfile = profileData?.data && typeof profileData.data === 'object'
            ? profileData.data
            : profileData;
          setUserProfile((prev) => ({
            ...profile,
            ...prev,
            ...normalizedProfile,
            address: normalizedProfile.address ?? prev?.address ?? profile.address ?? '',
            bio: normalizedProfile.bio ?? prev?.bio ?? profile.bio ?? '',
          }));
        } else {
          setUserProfile(profile);
        }
      }
    }
    fetchProfile();
  }, [profile, reloadProfile]);


  const initials = useMemo(() => {
    return (userProfile?.firstName?.[0] ?? '') + (userProfile?.lastName?.[0] ?? '');
  }, [userProfile?.firstName, userProfile?.lastName]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${year}-${month}-${day}`;
  };

  // ── handlers ───────────────────────────────────────────────────────────────

  const startEditing = () => {
    setDraft({
      id: userProfile?.id ?? '',
      firstName: userProfile?.firstName ?? '',
      lastName: userProfile?.lastName ?? '',
      role: userProfile?.role ?? '',
      email: userProfile?.email ?? '',
      phone: userProfile?.phone ?? '',
      address: userProfile?.address ?? '',
      birthDate: userProfile?.birthDate ? formatDate(userProfile.birthDate) : '',
      joiningDate: userProfile?.joiningDate ? formatDate(userProfile.joiningDate) : '',
      bio: userProfile?.bio ?? '',
      skills: Array.isArray(userProfile?.skills)
        ? userProfile.skills.join(', ')
        : userProfile?.skills ?? '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const saveProfile = async () => {
    // wire to your API here
    setIsEditing(true);
    console.log(draft);
    const requiredFields = {
      firstName: "Please Enter First Name",
      email: "Please Enter Email",
      role: "Please Select Role",
    };
    for (const [field, message] of Object.entries(requiredFields)) {
      if (!draft[field] || draft[field].toString().trim() === "") {
        toast.error(message);
        setIsEditing(false);
        return;
      }
    }
    const updateProfile = {
      ...draft,
      status: userProfile?.status || 'Active',
      password_old: userProfile?.password,
      password: userProfile?.password,
      skills: typeof draft.skills === 'string'
        ? draft.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : draft.skills ?? [],
    };
    try {
      const response = await register(updateProfile, userProfile);
      if (response?.status === 200) {
        setUserProfile((prev) => ({
          ...prev,
          ...updateProfile,
          address: draft.address ?? '',
          bio: draft.bio ?? '',
        }));
        toast.success(draft.id ? toastMessages.updateUserSuccess : toastMessages.addUserSuccess);
        setReloadProfile((prev) => !prev);
      } else {
        toast.error(toastMessages.internalServerError);
      }
    } catch (err) {
      toast.error(toastMessages.internalServerError);
    } finally {
      setIsEditing(false);
    }
  };

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const skills = Array.isArray(userProfile?.skills)
    ? userProfile.skills
    : (userProfile?.skills ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <section className="px-3 py-4 md:px-4 md:py-6 lg:px-6 lg:py-8">
      <div className="relative overflow-hidden bg-transparent app-panel">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 app-panel" />
        <div className="pointer-events-none absolute -right-16 top-24 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 grid gap-5">
          <div className="rounded-[28px] border border-slate-700/70 app-panel p-5 shadow-[0_20px_45px_rgba(2,6,23,0.22)] md:p-6">

            {/* ── top row ── */}
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                {/* avatar */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-300 text-3xl font-bold text-slate-950 shadow-[0_20px_50px_rgba(56,189,248,0.28)]">
                  {initials}
                  <div className="absolute -right-2 -top-2 rounded-2xl app-card border p-2 text-sky-300">
                    <Sparkles size={14} />
                  </div>
                </div>
                {/* name / role / bio */}
                <div className="min-w-0">
                  <div className={`inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] ${theme === 'dark' ? "text-sky-200" : ""}`}>
                    <Sparkles size={12} />
                    Profile Overview
                  </div>
                  <h1 className="mt-3 app-page-title">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </h1>
                  <p className="mt-2 text-base app-muted">{userProfile?.role}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 app-muted">{userProfile?.bio || 'No bio added yet.'}</p>
                </div>
              </div>

              {/* action buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-600/80 app-panel px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(2,6,23,0.22)] transition hover:-translate-y-0.5 hover:border-sky-400/60 hover:text-sky-200"
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
                <Link
                  to="/change-password"
                  className="btn-primary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition"
                >
                  Change Password
                </Link>
              </div>
            </div>

            {/* ── info cards ── */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Email', icon: <Mail size={16} className="text-sky-300" />, value: userProfile?.email },
                { label: 'Phone', icon: <Phone size={16} className="text-sky-300" />, value: userProfile?.phone },
                { label: 'Address', icon: <MapPin size={16} className="text-sky-300" />, value: userProfile?.address },
                { label: 'Joined', icon: <CalendarDays size={16} className="text-sky-300" />, value: formatDate(userProfile?.joiningDate) },
              ].map(({ label, icon, value }) => (
                <div key={label} className="app-card rounded-2xl border p-4 text-sm shadow-[0_10px_30px_rgba(2,6,23,0.08)]">
                  <p className="app-muted text-sm uppercase tracking-[0.26em]">{label}</p>
                  <div className="mt-3 flex items-center gap-3 app-heading">{icon}{value || '—'}</div>
                </div>
              ))}
              <div className="app-card rounded-2xl border p-4 text-sm shadow-[0_10px_30px_rgba(2,6,23,0.08)] sm:col-span-2">
                <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Birthday</p>
                <div className="mt-3 flex items-center gap-3">
                  <CalendarDays size={16} className="text-sky-300" />
                  {formatBirthDate(userProfile?.birthDate)}
                </div>
              </div>
              {/* show bio */}
              {/* <div className="app-card rounded-2xl border p-4 text-sm shadow-[0_10px_30px_rgba(2,6,23,0.08)] sm:col-span-2">
                <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Bio</p>
                <div className="mt-3 flex items-center gap-3 app-heading">
                  <p className="text-sm">{userProfile?.bio?.length > 0 ? userProfile?.bio : 'No bio added yet.'}</p>
                </div>
              </div> */}
            </div>

            {/* ── skills ── */}
            {/* <div className="mt-4">
              <div className="rounded-[28px] border border-slate-700/70 app-panel p-5 shadow-[0_20px_45px_rgba(2,6,23,0.22)] md:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-200">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="app-heading text-xl font-semibold">Core Skills</h2>
                    <p className="mt-1 text-sm text-slate-400">Strength areas across delivery and management.</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {skills.length > 0
                    ? skills.map((skill) => (
                      <span key={skill} className={`rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm ${theme === 'dark' ? 'text-emerald-100' : 'text-emerald-900'}`}>
                        {skill}
                      </span>
                    ))
                    : <span className="text-sm text-slate-500">No skills listed.</span>
                  }
                </div>
              </div>
            </div> */}

          </div>
        </div>
      </div>

      {/* ── Edit modal ──────────────────────────────────────────────────────── */}
      {isEditing && (
        <div
          className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={cancelEditing}
        >
          <div
            className="app-modal w-full max-w-3xl rounded-[28px] border p-6 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-sm uppercase tracking-[0.32em] text-sky-400/80">Edit Profile</p>
                <h2 className="app-modal-title">Update your details</h2>
              </div>
              <button
                type="button"
                onClick={cancelEditing}
                className="btn-secondary shrink-0 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm transition"
              >
                Close
              </button>
            </div>

            {/* form fields */}
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: 'First Name', field: 'firstName', type: 'text' },
                { label: 'Last Name', field: 'lastName', type: 'text' },
                { label: 'Role', field: 'role', type: 'text' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Phone', field: 'phone', type: 'number' },
                { label: 'Address', field: 'address', type: 'text' },
              ].map(({ label, field, type }) => (
                <label key={field} className="block">
                  <span className="app-label mb-2 block text-sm">{label}</span>
                  <input
                    type={type}
                    value={draft[field] ?? ''}
                    // if field is role, then disable the input user cant change the role
                    onChange={(e) => field === 'role' ? null : updateDraft(field, e.target.value)}
                    className={`app-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition min-h-[48px] focus:border-sky-400 ${field === 'role' ? 'cursor-not-allowed disabled:opacity-60' : ''}`}
                  />
                </label>
              ))}

              <label className="block">
                <span className="app-label mb-2 block text-sm">Birthday</span>
                <input
                  type="date"
                  value={draft.birthDate ?? ''}
                  min={dateMin()}
                  max={dateMax()}
                  onChange={(e) => updateDraft('birthDate', e.target.value)}
                  className="app-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition min-h-[48px] focus:border-sky-400"
                />
              </label>
              <label className="block">
                <span className="app-label mb-2 block text-sm">Joining Date</span>
                <input
                  type="date"
                  value={draft.joiningDate ?? ''}
                  min={dateMin()}
                  max={dateMax()}
                  onChange={(e) => updateDraft('joiningDate', e.target.value)}
                  className="app-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition min-h-[48px] focus:border-sky-400"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="app-label mb-2 block text-sm">Bio</span>
                <textarea
                  rows={4}
                  value={draft.bio ?? ''}
                  onChange={(e) => updateDraft('bio', e.target.value)}
                  className="app-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-sky-400 placeholder:text-slate-500"
                />
              </label>

              {/* <label className="block md:col-span-2">
                <span className="app-label mb-2 block text-sm">Skills</span>
                <input
                  type="text"
                  value={draft.skills ?? ''}
                  onChange={(e) => updateDraft('skills', e.target.value)}
                  placeholder="Project Planning, Agile Delivery, Client Communication"
                  className="app-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition min-h-[48px] focus:border-sky-400"
                />
                <p className="mt-2 text-sm text-slate-500">Separate each skill with a comma.</p>
              </label> */}
            </div>

            {/* footer */}
            <div className="mt-6 flex justify-end gap-3 app-divider border-t pt-5">
              <button
                type="button"
                onClick={cancelEditing}
                className="btn-secondary inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                className="btn-primary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const mapStateToProps = (state) => ({
  profile: state.session.user?.user,
});

export default connect(mapStateToProps)(Profile);