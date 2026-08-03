import React, { useEffect, useState } from "react";
import { finalizeHours, listTimesheetWeeklyReport, listWorks } from "../../controller/auth/loginApis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import toastMessages from "../../utils/ToastMassages";
import ConfirmDialog from "../ConfirmDialog";
import * as XLSX from "xlsx-js-style";
import { ThoughtMateProgressLoaderAnimated } from "../TMLoader/ThoughtMateProgressLoaderAnimated";

// ─── pure logic helpers (unchanged) ──────────────────────────────────────────

const calculateHours = (mills) => {
  let value = parseInt(mills / (1000 * 60 * 60));
  return value < 10 ? `0${value}` : `${value}`;
};
const calculateMinutes = (mills) => {
  let value = parseInt(mills % (1000 * 60 * 60)) / (1000 * 60);
  return value < 10 ? `0${value}` : `${value}`;
};
const removeQueryParam = (url) => url?.split("?")[0] ?? "";

const mergeOrPushSheet = (clientSheetList, newSheet) => {
  clientSheetList.approvedHoursMills ??= 0;
  clientSheetList.timeSpentMills ??= 0;
  const index = clientSheetList.sheets.findIndex((item) => item.workId === newSheet.workId);
  if (index !== -1) {
    const existing = clientSheetList.sheets[index];
    existing.taskName = Array.from(
      new Set(
        [existing.taskName, newSheet.taskName]
          .filter(Boolean).join(", \n").split(/,\s*\n?/).map((s) => s.trim())
      )
    ).join(", \n");
    existing.links = Array.from(
      new Set(
        [existing.links, removeQueryParam(newSheet.links)]
          .filter(Boolean).join(", \n").split(/,\s*\n?/).map((s) => s.trim())
      )
    ).join(", \n");
    existing.comments = [existing.comments, newSheet.comments].filter(Boolean).join(", \n");
    existing.approvedHoursMills += newSheet.approvedHoursMills;
    existing.approvedHours = calculateHours(existing.approvedHoursMills);
    existing.approvedMinutes = calculateMinutes(existing.approvedHoursMills);
    existing.timeSpentMills += newSheet.timeSpentMills;
    existing.timeSpentHours = calculateHours(existing.timeSpentMills);
    existing.timeSpentMinutes = calculateMinutes(existing.timeSpentMills);
    existing.exportApprovedHours = existing.approvedHoursMills / (1000 * 60 * 60);
    if (!existing.timesheetIds.includes(newSheet.id)) existing.timesheetIds.push(newSheet.id);
    clientSheetList.sheets[index] = existing;
  } else {
    newSheet.timesheetIds ??= [];
    newSheet.timesheetIds.push(newSheet.id);
    delete newSheet._id;
    clientSheetList.sheets.push(newSheet);
  }
  clientSheetList.timeSpentMills += newSheet.timeSpentMills ? newSheet.timeSpentMills : 0;
  clientSheetList.timeSpentHours = calculateHours(clientSheetList.timeSpentMills);
  clientSheetList.timeSpentMinutes = calculateMinutes(clientSheetList.timeSpentMills);
  clientSheetList.approvedHoursMills += newSheet.approvedHoursMills ? newSheet.approvedHoursMills : 0;
  clientSheetList.approvedHours = calculateHours(clientSheetList.approvedHoursMills);
  clientSheetList.approvedMinutes = calculateMinutes(clientSheetList.approvedHoursMills);
  clientSheetList.exportApprovedHours = clientSheetList.approvedHoursMills / (1000 * 60 * 60);
};

const formatDate = (dateStr) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  let date = new Date(dateStr);
  let dayOfWeek = date.getDay();
  let offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  let startDate = new Date(date.getTime() + offset * MS_PER_DAY);
  let endDate = new Date(startDate.getTime() + 6 * MS_PER_DAY);
  const format = (d) => `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
  return `${format(startDate)} -To- ${format(endDate)}`;
};

const mapResponse = (timesheets, works) => {
  let dayWiseButtons = {};
  const dayWiseSheetsByDateThenClient = {};
  let sheets = timesheets?.data?.map((timesheet) => {
    const workId = timesheet.work?.id;
    const client = works?.find(({ id }) => id === workId)?.project?.client?.clientName || "";
    const clientId = works?.find(({ id }) => id === workId)?.project?.client?.id || "";
    const dateKey = timesheet.executionDate ? formatDate(timesheet.executionDate.split("T")[0]) : null;
    let sheet = {
      id: timesheet.id,
      _id: timesheet.id,
      status: timesheet.status,
      taskType: timesheet.taskType,
      action: timesheet.action,
      links: removeQueryParam(timesheet.links),
      comments: timesheet.comments,
      timeSpentMills: timesheet.timeSpentMills,
      timeSpentHours: calculateHours(timesheet.timeSpentMills),
      timeSpentMinutes: calculateMinutes(timesheet.timeSpentMills),
      exportSpentHours: timesheet.timeSpentMills / (1000 * 60 * 60),
      approvedHoursMills: timesheet.approvedHoursMills,
      approvedHours: calculateHours(timesheet.approvedHoursMills),
      approvedMinutes: calculateMinutes(timesheet.approvedHoursMills),
      exportApprovedHours: timesheet.approvedHoursMills / (1000 * 60 * 60),
      workName: timesheet.work?.workName,
      workId,
      client,
      clientId,
      taskName: timesheet.task?.taskName,
      taskId: timesheet.task?.id,
      executionDate: timesheet.executionDate ? new Date(timesheet.executionDate) : "",
      hoursStatus: timesheet.hoursStatus,
    };
    if (dateKey) {
      dayWiseButtons[dateKey] ??= {};
      if (sheet.hoursStatus === 1) dayWiseButtons[dateKey].isSubmitted = true;
      if (sheet.hoursStatus === 2) dayWiseButtons[dateKey].isApproved = true;
      dayWiseSheetsByDateThenClient[dateKey] ??= {};
      dayWiseSheetsByDateThenClient[dateKey][client] ??= {};
      dayWiseSheetsByDateThenClient[dateKey][client].sheets ??= [];
      mergeOrPushSheet(dayWiseSheetsByDateThenClient[dateKey][client], sheet);
    }
    return sheet;
  });

  const sortedDayWiseByClient = {};
  for (const [date, clientGroup] of Object.entries(dayWiseSheetsByDateThenClient)) {
    const sortedClientGroup = Object.entries(clientGroup)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((obj, [client, sheets]) => { obj[client] = sheets; return obj; }, {});
    sortedDayWiseByClient[date] = sortedClientGroup;
  }
  return { sheets, dayWiseSheets: {}, dayWiseSheetsByDateThenClient: sortedDayWiseByClient, dayWiseButtons };
};

const getLastFiveWeeks = () => {
  const weeks = [];
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + diffToMonday);
  for (let i = 0; i < 5; i++) {
    const monday = new Date(thisMonday);
    monday.setDate(thisMonday.getDate() - i * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mondayStart = new Date(monday.setHours(0, 0, 0, 0));
    const sundayEnd = new Date(sunday.setHours(23, 59, 59, 999));
    const formatLabel = (d) =>
      d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
    weeks.push({
      value: `${mondayStart.toISOString()},${sundayEnd.toISOString()}`,
      label: `${formatLabel(mondayStart)} -To- ${formatLabel(sundayEnd)}`,
    });
  }
  return weeks;
};

const exportColumns = [
  { field: "workName", headerName: "Task" },
  { field: "links", headerName: "Links" },
  { field: "comments", headerName: "Description" },
  { field: "exportApprovedHours", headerName: "Hours" },
];

// ─── TimeCell — styled hour display ──────────────────────────────────────────

function TimeCell({ hours, minutes, status, type }) {
  // type: "spent" | "approved"
  const isHighlighted =
    (type === "spent" && status === 1) || (type === "approved" && status === 2);
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-mono font-medium tabular-nums ${isHighlighted
        ? type === "approved"
          ? "bg-green-500/10 text-green-400 border border-green-500/20"
          : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
        : "text-slate-400"
        }`}
    >
      {hours}:{minutes}
    </span>
  );
}

// ─── ClientTable — replaces DataGrid per client ───────────────────────────────

function ClientTable({ sheets, isAdmin }) {
  if (!sheets?.length)
    return <p className="text-slate-500 text-sm px-4 py-6">No entries.</p>;

  return (
    <div className="app-card w-full rounded-xl border overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
        <table className="min-w-full text-sm text-left">
          <thead
            className="sticky top-0 z-10 text-sm uppercase tracking-wide app-divider border-b"
            style={{ backgroundColor: "var(--app-table-header-bg)", color: "var(--app-muted-text)" }}
          >
            <tr>
              <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[260px]">Work</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[200px]">Task</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[280px]">Links</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[280px]">Comments</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Time Spent</th>
              {isAdmin && <th className="px-4 py-3 font-semibold whitespace-nowrap">Approved Hours</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sheets.map((row, i) => (
              <tr key={row.id ?? i} className="transition align-top">
                <td className="px-4 py-3 text-sm text-slate-200 whitespace-normal">{row.workName || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-400 whitespace-normal">{row.taskName || "—"}</td>
                <td className="px-4 py-3 text-sm text-sky-400 whitespace-pre-line break-all">
                  {row.links
                    ? row.links.split(/,\s*\n?/).map((link, li) =>
                      link.trim() ? (
                        <a key={li} href={link.trim()} target="_blank" rel="noreferrer"
                          className="block underline underline-offset-2 hover:text-sky-300 transition truncate max-w-[260px]">
                          {link.trim()}
                        </a>
                      ) : null
                    )
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-400 whitespace-pre-line">{row.comments || "—"}</td>
                <td className="px-4 py-3">
                  <TimeCell hours={row.timeSpentHours} minutes={row.timeSpentMinutes} status={row.hoursStatus} type="spent" />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <TimeCell hours={row.approvedHours} minutes={row.approvedMinutes} status={row.hoursStatus} type="approved" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ViewReport ───────────────────────────────────────────────────────────────

const ViewReport = (props) => {
  const [dayWiseSheetsByDateThenClient, setDayWiseSheetsByDateThenClient] = useState({});
  const [dayWiseButtons, setDayWiseButtons] = useState({});
  const [weekFilter, setWeekFilter] = useState(getLastFiveWeeks()[0].value);
  const [loading, setLoading] = useState(false);

  const isAdmin = props?.profile?.role === "ADMIN";

  // ── finalize (unchanged) ─────────────────────────────────────────────────

  const finalizeTimesheetHours = async () => {
    setLoading(true);
    if (dayWiseSheetsByDateThenClient) {
      let sheetsToFinalize = [];
      Object.keys(dayWiseSheetsByDateThenClient).forEach((id) => {
        Object.keys(dayWiseSheetsByDateThenClient[id]).forEach((client) => {
          dayWiseSheetsByDateThenClient[id][client].sheets.forEach((ts) => sheetsToFinalize.push(ts));
        });
      });
      if (sheetsToFinalize.length > 0) {
        let response = { data: {} };
        await finalizeHours({ timesheets: sheetsToFinalize }, props.profile);
        if (response?.data) {
          toast.success(`${toastMessages.saveTimesheetHourApprovedSuccess} For ${response.data?.data?.count} sheet(s).`);
        }
      } else {
        toast.warn(toastMessages.noTimesheetHourToApprove);
      }
    } else {
      toast.warn(toastMessages.noTimesheetHourToApprove);
    }
    setLoading(false);
  };

  // ── export (unchanged) ───────────────────────────────────────────────────

  const getSheetName = (input) =>
    input.replace(
      /^(\d+)-([A-Za-z]+)-(\d+)\s+-To-\s+\d+-\2-\3$/,
      (_, startDay, month, year) => {
        const endDay = input.match(/\s+-To-\s+(\d+)-/)[1];
        return `${startDay}-${endDay}-${month}-${year}`;
      }
    );

  const exportToExcel = (dateKey, client) => {
    const exportedRows = dayWiseSheetsByDateThenClient[dateKey][client].sheets;
    const exportApprovedHours = dayWiseSheetsByDateThenClient[dateKey][client].exportApprovedHours;
    if (!exportedRows?.length) { toast.warn("No data available to export."); return; }
    const worksheetData = exportedRows.map((row) => exportColumns.map((col) => row[col.field] ?? ""));
    worksheetData.push([]);
    worksheetData.push(["", "", "Total:", exportApprovedHours]);
    const worksheet = XLSX.utils.aoa_to_sheet([exportColumns.map((col) => col.headerName), ...worksheetData]);
    const blackThinBorder = { top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } }, left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } } };
    const setCellStyle = (cell, style) => { if (worksheet[cell]) worksheet[cell].s = style; };
    const headerStyle = (size) => ({ font: { bold: true, sz: size, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "6d9eeb" } }, alignment: { horizontal: "center", vertical: "center" }, border: blackThinBorder });
    exportColumns.forEach((_, i) => setCellStyle(XLSX.utils.encode_cell({ r: 0, c: i }), headerStyle(16)));
    worksheet["!cols"] = exportColumns.map((col) => {
      let maxLen = Math.max(col.headerName.length, ...exportedRows.map((r) => (r[col.field] ? r[col.field].toString().length : 0)));
      if (maxLen > 80) maxLen = 80;
      if (maxLen < 10) maxLen = 10;
      return { wch: maxLen };
    });
    const numberOfDataRows = exportedRows.length;
    worksheet["!rows"] = [
      { hpt: 28 },
      ...exportedRows.map((row) => {
        const maxLen = Math.max(...exportColumns.map((col) => {
          const value = row[col.field] ?? "";
          if (typeof value !== "string") return value.toString().length;
          return value.split("\n").map((line) => (line.length > 80 ? Math.ceil(line.length / 80) : 1)).reduce((s, c) => s + c, 0) * 80;
        }));
        const lines = Math.ceil(maxLen / 80);
        return { hpt: lines < 3 ? 20 * lines : lines > 6 ? 16 * lines : 18 * lines };
      }),
      { hpt: 28 }, { hpt: 28 },
    ];
    const lastDataRow = 2 + numberOfDataRows;
    worksheet[`C${lastDataRow + 1}`].s = headerStyle(16);
    worksheet[`D${lastDataRow + 1}`].s = headerStyle(16);
    for (let r = 1; r < numberOfDataRows + 1; r++) {
      exportColumns.forEach((_, c) => {
        const cell = XLSX.utils.encode_cell({ r, c });
        if (worksheet[cell]) worksheet[cell].s = { ...worksheet[cell].s, alignment: { ...(worksheet[cell].s?.alignment || {}), wrapText: true }, border: blackThinBorder };
      });
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `WR ${getSheetName(dateKey)}`);
    XLSX.writeFile(workbook, "DataGridExport.xlsx");
  };

  // ── fetch (unchanged) ────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const works = await listWorks(props.profile);
        const timesheets = await listTimesheetWeeklyReport(props.profile, weekFilter);
        const data = mapResponse(timesheets, works?.data);
        setDayWiseSheetsByDateThenClient(data.dayWiseSheetsByDateThenClient);
        setDayWiseButtons(data.dayWiseButtons);
      } catch (error) {
        console.error("Error fetching Timesheet data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (props?.profile) fetchData();
  }, [props.profile, weekFilter]);

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <section className="relative mt-3 md:mt-4 lg:mt-5">
      <ToastContainer position="top-center" theme="colored" />

      {/* ── page header + week filter ─────────────────────────────────────── */}
      <div className="pb-4 flex justify-between gap-3 mb-6 flex-col sm:flex-row sm:items-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">Weekly Report</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400 whitespace-nowrap">Filter by week</label>
          <select
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            className="app-input rounded-xl border px-4 py-2 text-sm outline-none transition focus:border-sky-400"
          >
            {getLastFiveWeeks().map((week, i) => (
              <option key={i} value={week.value}>{week.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── week blocks ───────────────────────────────────────────────────── */}
      {Object.keys(dayWiseSheetsByDateThenClient).length === 0 && !loading && (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          No timesheet data for this week.
        </div>
      )}

      {Object.keys(dayWiseSheetsByDateThenClient).map((dateKey) => (
        <div key={dateKey} className="mb-10">

          {/* week heading + finalize button */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-sky-400/80 mb-1">Week</p>
              <h2 className="app-heading text-2xl font-bold">{dateKey}</h2>
            </div>
            {isAdmin && Object.keys(dayWiseSheetsByDateThenClient[dateKey]).length > 0 && (
              <ConfirmDialog
                buttonName="Finalize Hours"
                id={dateKey}
                title="Confirm Finalize Hours"
                message="Are you sure you want to finalize hours?"
                onConfirm={finalizeTimesheetHours}
                disabled={dayWiseButtons[dateKey]?.disabled}
              />
            )}
          </div>

          {/* client sections */}
          <div className="flex flex-col gap-6">
            {Object.keys(dayWiseSheetsByDateThenClient[dateKey]).map((client) => {
              const clientData = dayWiseSheetsByDateThenClient[dateKey][client];
              return (
                <div key={client} className="app-card rounded-[20px] border overflow-hidden">

                  {/* client header */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4 app-divider border-b">
                    <div className="flex items-center gap-3">
                      {/* avatar initial */}
                      <div className="h-8 w-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-sm font-bold shrink-0">
                        {client.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="app-heading text-base font-semibold">{client}</h3>
                    </div>

                    {/* export button */}
                    <button
                      onClick={() => exportToExcel(dateKey, client)}
                      className="btn-secondary inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Export to Excel
                    </button>
                  </div>

                  {/* table */}
                  <div className="p-4">
                    <ClientTable sheets={clientData.sheets} isAdmin={isAdmin} />
                  </div>

                  {/* totals footer */}
                  <div className="app-card flex items-center justify-end gap-6 px-5 py-3 app-divider border-t">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>Total time spent</span>
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-sm font-mono font-medium tabular-nums bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {clientData.timeSpentHours}:{clientData.timeSpentMinutes}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Total approved</span>
                        <span className="inline-flex items-center rounded-md px-2 py-1 text-sm font-mono font-medium tabular-nums bg-green-500/10 text-green-400 border border-green-500/20">
                          {clientData.approvedHours}:{clientData.approvedMinutes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <ThoughtMateProgressLoaderAnimated />
        </div>
      )}
    </section>
  );
};

export default ViewReport;