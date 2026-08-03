import { CheckSquare, FolderKanban, Users, PartyPopper } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MyTable from '../MyTable/MyTable';
import { connect } from 'react-redux';
import { taskPage } from '../../controller/auth/loginApis';
import Confetti from 'react-confetti';
import Counter from '../Counter/Counter';
import taskStatus from '../../utils/TaskStatus';
import { ThoughtMateProgressLoaderAnimated } from '../TMLoader/ThoughtMateProgressLoaderAnimated';

// ── key used to track if welcome has already been shown this session ──────────
const WELCOME_SHOWN_KEY = 'tms_welcome_shown';
const SHOW_LOADER = 'tms_show_loader';

const Dashboard = ({ profile }) => {
    const [rows, setRows] = useState([]);
    const [works, setWorks] = useState([]);
    const [todayTotalTasks, setTodayTotalTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const getStatus = (status) => {
        return taskStatus.filter((s) => s.id === status)[0]?.value || status;
    }
    
    console.log("todayTotalTasks", todayTotalTasks);
    // Only show if this is the first render since login (not on re-navigation)
    const [showConfetti, setShowConfetti] = useState(() => {
        const alreadyShown = sessionStorage.getItem(WELCOME_SHOWN_KEY);
        return !alreadyShown;
    });
    const [showWelcomePopup, setShowWelcomePopup] = useState(() => {
        const alreadyShown = sessionStorage.getItem(WELCOME_SHOWN_KEY);
        return !alreadyShown;
    });

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    

    useEffect(() => {
        const fetchData = async () => {
            try {

                if(sessionStorage.getItem(SHOW_LOADER) === 'true') {
                    setLoading(true);
                } else {
                    setTimeout(() => {
                        sessionStorage.setItem(SHOW_LOADER, 'true');
                    }, 8000);
                }
                if (!profile) return;
                const res = await taskPage(profile);
                setRows(res?.data?.allUsers?.length || []);
                setWorks(res?.data?.allWorks);
                setTodayTotalTasks(res?.data?.allTasks?.filter((t) => t.status !== "11").map((t) => {
                    return {
                        workName: t.work.workName,
                        taskName: t.taskName,
                        assignedTo: t.assignedTo?.firstName + " " + t.assignedTo?.lastName,
                        qa: t.qa ? t.qa?.firstName + " " + t.qa?.lastName : '-',
                        status: getStatus(t.status),
                        workLink: t.work?.workLink
                    }
                }));
                console.log("Last 7 days' tasks:", res);
            } catch (err) {
                console.error("Error fetching task data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [profile]);

    useEffect(() => {
        // console.log(history?.location?.state?.searchResults);
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);

        // Mark as shown immediately so re-navigation never triggers it again
        if (!sessionStorage.getItem(WELCOME_SHOWN_KEY)) {
            sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
            sessionStorage.setItem(SHOW_LOADER, 'false');

            const confettiTimer = setTimeout(() => setShowConfetti(false), 8000);
            const popupTimer = setTimeout(() => setShowWelcomePopup(false), 8000);

            return () => {
                window.removeEventListener('resize', handleResize);
                clearTimeout(confettiTimer);
                clearTimeout(popupTimer);
            };
        }

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const dismissWelcome = () => {
        setShowConfetti(false);
        setShowWelcomePopup(false);
    };

    const stats = [
        { label: "Total Works", value: works?.length, trend: "up", icon: <FolderKanban size={18} /> },
        { label: "Today Tasks", value: todayTotalTasks.length, trend: "down", icon: <CheckSquare size={18} /> },
        { label: "Team Members", value: rows, trend: "up", icon: <Users size={18} /> },
    ];

    const iconColors = [
        { bg: "bg-purple-500", text: "text-purple-100" },
        { bg: "bg-teal-900", text: "text-teal-100" },
        { bg: "bg-amber-700", text: "text-amber-100" },
    ];

    const columns = [
        {
            header: "Work Name", accessor: "workName",
            render: (value, row) => value ? (
                <a
                    href={row.workLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-400 underline underline-offset-4 transition hover:text-blue-300 break-all"
                >
                    {value}
                </a>
            ) : "-",
        },
        { header: "Task Name", accessor: "taskName", isLink: true, linkAccessor: "taskLink" },
        { header: "Assigned To", accessor: "assignedTo" },
        { header: "QA", accessor: "qa" },
        {
            header: "Status",
            accessor: "status",
            render: (value) => {
                const styles = {
                    "QA": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                    "In Progress + QA": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                    "Assigned": "bg-green-500/5 text-green-400 border border-green-500/20",
                    "Sent To Client": "bg-green-500/20 text-green-400 border border-green-500/20",
                    "In Progress": "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
                    "On Hold": "bg-red-500/10 text-red-400 border border-red-500/20",
                    "Waiting For Client Feedback": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
                    "Comments In Trello": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
                    "Feedback From QA": "bg-gray-500/10 text-gray-400 border border-gray-500/20",
                };
                return (
                    <span className={`px-2 py-1 rounded-md text-xs font-normal ${styles[value] ?? ""}`}>
                        {value}
                    </span>
                );
            },
        },
    ];



    return (
        <section className='py-5 md:py-8 relative'>

            {/* Confetti — only renders when showConfetti is true */}
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    numberOfPieces={1000}
                    recycle={false}
                    gravity={0.12}
                    className="!fixed top-0 left-0 w-full h-full z-50 pointer-events-none"
                />
            )}

            {/* Welcome popup — only renders when showWelcomePopup is true */}
            {showWelcomePopup && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
                    <div className="relative w-full max-w-md rounded-[28px] border border-slate-700 bg-slate-950 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.6)] text-center"
                        style={{ animation: "popup 0.35s ease-out" }}
                    >
                        {/* close X */}
                        <button
                            onClick={dismissWelcome}
                            className="absolute right-4 top-4 rounded-xl border border-slate-700 p-1.5 text-slate-400 transition hover:border-slate-500 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                                <PartyPopper size={28} />
                            </div>
                        </div>

                        <p className="mb-1 text-xs uppercase tracking-[0.32em] text-sky-400/80">Welcome back</p>
                        <h2 className="text-2xl font-bold text-white">
                            Welcome to TMS 🎉
                        </h2>
                        <p className="mt-3 text-sm text-slate-400">
                            Glad to have you back, <span className="text-white font-medium">{profile?.firstName || 'User'}</span>!
                        </p>

                        <button
                            onClick={dismissWelcome}
                            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 hover:-translate-y-0.5"
                        >
                            Let's Go
                        </button>
                    </div>
                </div>
            )}

            {/* page header */}
            <div className='flex justify-between flex-col md:flex-row'>
                <div>
                    <h1 className='text-2xl lg:text-3xl xl:text-4xl'>
                        Welcome back, {profile?.firstName} <span className='inline-block animate-wave'>👋</span>
                    </h1>
                </div>
                <div className='mt-5 md:mt-0'>
                    <Link to='/tasks' className="inline-flex min-h-[46px] items-center justify-center rounded-md border px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] no-underline shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55 border-sky-400/30 bg-sky-500/10 text-sky-300 hover:border-sky-300/50 hover:bg-sky-500/15 hover:text-sky-100 mr-3">
                        + Add Task
                    </Link>
                    {profile?.role !== 'EMPLOYEE' && (
                        <Link to='/projects' className="inline-flex min-h-[46px] items-center justify-center rounded-md border px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] no-underline shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55 border-transparent bg-gradient-to-r from-sky-500 to-blue-600">
                            + New Project
                        </Link>
                    )}
                </div>
            </div>

            {/* stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 md:mt-8">
                {stats.map((stat, i) => (
                    <div key={i} className="flex justify-between items-start p-5 py-4 md:py-7 border border-slate-800 rounded-xl bg-slate-900 transition-colors">
                        <div>
                            <p className="text-md text-slate-400 mb-1">{stat.label}</p>
                            {/* <h3 className="text-2xl md:text-3xl font-medium text-white">{stat.value}</h3> */}
                            <Counter value={stat.value} duration={1000} />
                        </div>
                        <div className={`p-2 rounded-lg ${iconColors[i].bg} ${iconColors[i].text}`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
                    <ThoughtMateProgressLoaderAnimated />
                </div>
            )}


            {/* recent tasks */}
            <div className='mt-8'>
                <MyTable
                    caption="Recent tasks"
                    columns={columns}
                    keyField="id"
                    data={todayTotalTasks}
                    emptyText={loading ? "Loading tasks…" : "No active tasks found"}
                />
            </div>

            <style>{`
                @keyframes popup {
                    0% { opacity: 0; transform: scale(0.85) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </section>
    );
};

const mapStateToProps = (stat) => ({
    profile: stat.session.user?.user,
    authenticated: stat.session.authenticated,
});

export default connect(mapStateToProps)(Dashboard);