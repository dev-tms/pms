import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { BsList, BsPersonBadge, BsPersonWorkspace, BsX } from 'react-icons/bs';
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { useLocation } from 'react-router-dom';
import './style.scss';
import { connect } from 'react-redux';
import { FaTasks } from 'react-icons/fa';
import { ImListNumbered } from 'react-icons/im';
import { GoProjectRoadmap } from 'react-icons/go';
import { TbReport } from 'react-icons/tb';


function ProfileImage(props) {

  const [isOpen, setIsOpen] = React.useState(false)
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  }
  const location = useLocation();

  const isActiveLink = (href) => {
    return location?.pathname === href;
  };

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction='left'
        className='drawer'
        enableOverlay={true}
        size={280}
      >
        <div className="d-flex flex-column flex-shrink-0 p-3 sidebar-container position-fixed" style={{ width: '280px', height: '92vh',backgroundColor: '#e5e5e5',color:'#000' }}>
          <ul className="nav nav-pills flex-column mb-auto">
             <li className="nav-item">
                <a href="/tasks" className={`nav-link  ${isActiveLink('/tasks') || isActiveLink('/') ? 'active' : ''}`} aria-current="page">
                  {/* <i className="bi bi-table mr-1"></i> */}
                  <FaTasks fontSize={20} />
                  <label className='sidepanel_label'>Tasks List</label>
                </a>
              </li>
            <li className="nav-item">
              <a href="/timesheets" className={`nav-link  ${isActiveLink('/timesheets') ? 'active' : ''}`} aria-current="page">
                <i className="bi bi-table mr-1"></i>
                <label className='sidepanel_label'>Timesheet</label>
              </a>
            </li>
           
            {(props.profile?.role === 'ADMIN' || props.profile?.role === 'TL' || props.profile?.role === 'QA') && <>
              
              {props.profile?.role === 'ADMIN' && <li className="nav-item">
                <a href="/users" className={`nav-link  ${isActiveLink('/users') ? 'active' : ''}`} aria-current="page">
                  {/* <i className="bi bi-table mr-1"></i> */}
                  <BsPersonBadge fontSize={20} />
                  <label className='sidepanel_label'>Employees List</label>
                </a>
              </li> }
              
              <li className="nav-item">
                <a href="/works" className={`nav-link  ${isActiveLink('/works') ? 'active' : ''}`} aria-current="page">
                  {/* <i className="bi bi-table mr-1"></i> */}
                  <ImListNumbered fontSize={18} />
                  <label className='sidepanel_label'>Work List</label>
                </a>
              </li>
              <li className="nav-item">
                <a href="/projects" className={`nav-link  ${isActiveLink('/projects') ? 'active' : ''}`} aria-current="page">
                  {/* <i className="bi bi-table mr-1"></i> */}
                   <GoProjectRoadmap fontSize={20} />
                  <label className='sidepanel_label'>Projects List</label>
                </a>
              </li>
              <li className="nav-item">
                <a href="/clients" className={`nav-link  ${isActiveLink('/clients') ? 'active' : ''}`} aria-current="page">
                  {/* <i className="bi bi-table mr-1"></i> */}
                   <BsPersonWorkspace fontSize={18} />
                  <label className='sidepanel_label'> Clients List</label>
                </a>
              </li>
              {props.profile?.role === 'ADMIN' && <li className="nav-item">
                <a href="/viewreport" className={`nav-link  ${isActiveLink('/viewreport') ? 'active' : ''}`} aria-current="page">
                  {/* <i className="bi bi-table mr-1"></i> */}
                  <TbReport fontSize={20} />
                  <label className='sidepanel_label'> Weekly Report</label>
                </a>
              </li> }
            </>}
          </ul>
        </div>
      </Drawer>
      <button onClick={toggleDrawer} className='position-fixed btn btn-link toogle-button drawer-btn d-xxl-none'> {isOpen ? <BsX size="30" /> : <BsList size="30" />}</button>
    </>

  );
}

const mapStateToProps = ({ session }) => {
  return {
    profile: session.user?.user
  }
}

export default connect(mapStateToProps)(ProfileImage);