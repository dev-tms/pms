import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BriefcaseBusiness, Cake, CalendarOff, CircleUser, Clock, FolderKanban, LayoutDashboard, Settings, SquareCheckBig, UsersRound } from 'lucide-react'
import { connect } from 'react-redux';
import logolight from '../../thoughtmate-logo-light.png';
import logo from '../../thoughtmate-logo-dark.png';

const Sidebar = ({ profile, authenticated, theme }) => {
    console.log("profile from sidebar", profile)
    console.log("profile from authenticated", authenticated)

    const getNavClass = ({ isActive }) =>
        `mx-3 my-1 flex items-center gap-2 rounded-lg px-4 py-3 transition-colors ${isActive
            ? 'sidebar-nav-link-active'
            : 'sidebar-nav-link'
        }`

    return (
        <div className='min-h-screen'>
            <div className='border-b' style={{ borderColor: 'var(--app-border)', padding: '23px 23px 20px' }}>
                <Link to='/'   >
                    <img src={theme === 'light' ? logo : logolight} alt='ThoughtMate logo' className='w-full' />
                    {/* <h1 className='text-3xl user-select-none' style={{ color: "#6E7172" }}>Thought<span className='' style={{ color: "#C07F00" }}>Mate</span></h1> */}
                </Link>
            </div>
            <nav className='py-4'>
                <NavLink
                    exact
                    to='/'
                    className={getNavClass}
                    activeClassName="sidebar-nav-link-active"
                // className="mx-3 my-1 flex items-center gap-2 rounded-lg px-4 py-3 relative transition-all duration-300 border-l-4 border-transparent"
                // activeClassName="bg-gray-100 text-black border-l-4 border-[#C07F00]"
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </NavLink>
                <NavLink
                    to='/tasks'
                    className={getNavClass}
                    activeClassName="sidebar-nav-link-active"  >
                    <SquareCheckBig size={18} />
                    Tasks
                </NavLink>
                <NavLink
                    to='/timesheets'
                    className={getNavClass}
                    activeClassName="sidebar-nav-link-active"  >
                    <Clock size={18} />
                    Timesheet
                </NavLink>
                {
                    (profile?.role === 'QA' || profile?.role === 'TL' || profile?.role === 'ADMIN') && (
                        <>
                            <NavLink
                                to='/projects'
                                className={getNavClass}
                                activeClassName="sidebar-nav-link-active" >
                                <FolderKanban size={18} />
                                Projects
                            </NavLink>
                            <NavLink
                                to='/clients'
                                className={getNavClass}
                                activeClassName="sidebar-nav-link-active"  >
                                <UsersRound size={18} />
                                Clients
                            </NavLink>
                            <NavLink
                                to='/works'
                                className={getNavClass}
                                activeClassName="sidebar-nav-link-active"  >
                                <BriefcaseBusiness size={18} />
                                Work
                            </NavLink>
                            {
                                profile?.role === 'ADMIN' && (
                                    <>
                                        <NavLink
                                            to='/users'
                                            className={getNavClass}
                                            activeClassName="sidebar-nav-link-active" >
                                            <BriefcaseBusiness size={18} />
                                            Employees List
                                        </NavLink>
                                        <NavLink
                                            to='/viewreport'
                                            className={getNavClass}
                                            activeClassName="sidebar-nav-link-active" >
                                            <BriefcaseBusiness size={18} />
                                            Weekly Report
                                        </NavLink>
                                    </>
                                )}

                        </>
                    )
                }



                <NavLink
                    to='/leave'
                    className={getNavClass}
                    activeClassName="sidebar-nav-link-active disabled" >
                    <CalendarOff size={18} />
                    Leaves
                </NavLink>
                <NavLink
                    to='/birthdays'
                    className={getNavClass}
                    activeClassName="sidebar-nav-link-active"  >
                    <Cake size={18} />
                    Birthdays
                </NavLink>
                <NavLink
                    to='/profile'
                    className={getNavClass}
                    activeClassName="sidebar-nav-link-active">
                    <CircleUser size={18} />
                    Profile
                </NavLink>
            </nav>
        </div>
    )
}



const mapStateToProps = ({ session }) => {
    return {
        profile: session?.user?.user,
    };
};

export default connect(mapStateToProps)(Sidebar);
