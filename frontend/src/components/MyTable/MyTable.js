// import React from "react";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";

// Built-in action button component for convenience
export function ActionButtons({ row, onEdit, onDelete, editLabel = "Edit", deleteLabel = "Delete" }) {
    return (
        <div className="flex items-center gap-2">
            {onEdit && (
                <button
                    onClick={() => onEdit(row)}
                    className="btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl border transition"
                >
                    <ModeEditOutlineIcon className="action_icon" />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={() => onDelete(row)}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                </button>
            )}
        </div>
    );
}

export default function MyTable({
    columns = [],
    data = [],
    keyField = "id",
    caption = "",
    emptyText = "No records found",
    onEdit,
    onDelete,
    showActions = false,
    actionsLabel = "Actions",
    containerClassName = "",
    tableClassName = "",
    headClassName = "",
    bodyClassName = "",
    rowClassName = "",
    emptyStateClassName = "",
}) {

    const resolvedColumns = showActions && !columns.find(c => c.accessor === "actions")
        ? [
            ...columns,
            {
                header: actionsLabel,
                accessor: "actions",
                render: (_, row) => (
                    <ActionButtons row={row} onEdit={onEdit} onDelete={onDelete} />
                ),
            },
        ]
        : columns;

    return (
        // ── outer wrapper: clips overflow, sets max height for scroll ──────
        <div
            className={`w-full rounded-xl border shadow-sm overflow-hidden ${containerClassName}`}
            style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card-bg)" }}
        >
            {/* ── scroll container: the ONLY element that scrolls ─────────── */}
            <div className="overflow-x-auto overflow-y-auto max-h-[550px]">
                <table className={`app-table min-w-full ${tableClassName}`}>
                    {caption ? (
                        <caption className="app-table-caption px-4 py-6">
                            {caption}
                        </caption>
                    ) : null}

                    {/* ── sticky thead ──────────────────────────────────────── */}
                    <thead
                        className={`app-table-head sticky top-0 z-2 border-b ${headClassName}`}
                        style={{
                            borderColor: "var(--app-border)",
                            backgroundColor: "var(--app-table-header-bg)",
                        }}
                    >
                        <tr>
                            {resolvedColumns.map((col) => (
                                <th
                                    key={col.accessor}
                                    scope="col"
                                    className={`app-table-th px-4 py-4 ${col.headerClassName ?? "whitespace-nowrap"}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className={bodyClassName} style={{ borderColor: "var(--app-table-divider)" }}>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={resolvedColumns.length}
                                    className={`app-table-td px-4 py-8 text-center ${emptyStateClassName}`}
                                    style={{ color: "var(--app-muted-text)" }}
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row[keyField] ?? rowIndex}
                                    className={`transition ${rowClassName}`}
                                    style={{ borderTop: "1px solid var(--app-table-divider)" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "var(--app-table-row-hover)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                >
                                    {resolvedColumns.map((col) => {
                                        const value = row[col.accessor];
                                        const linkValue = col.linkAccessor ? row[col.linkAccessor] : value;
                                        const labelValue = col.linkTextAccessor ? row[col.linkTextAccessor] : value;
                                        return (
                                            <td
                                                key={col.accessor}
                                                className={`app-table-td px-4 py-3 align-middle ${col.cellClassName ?? "whitespace-nowrap"}`}
                                            >
                                                {col.render
                                                    ? col.render(value || "-", row, rowIndex)
                                                    : col.isLink && linkValue
                                                        ? (
                                                            <a
                                                                href={linkValue}
                                                                target={col.openInNewTab === false ? undefined : "_blank"}
                                                                rel={col.openInNewTab === false ? undefined : "noreferrer"}
                                                                className="font-medium text-blue-400 underline underline-offset-4 transition hover:text-blue-300"
                                                            >
                                                                {labelValue ?? linkValue}
                                                            </a>
                                                        )
                                                        : value ?? "-"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
