import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const ACTION_CONFIG = {
  signature_placed:           { label: "Signature Placed",   icon: "✍",  color: "bg-blue-100 text-blue-700"   },
  signature_signed:           { label: "Signature Signed",   icon: "✅",  color: "bg-green-100 text-green-700" },
  signature_rejected:         { label: "Signature Rejected", icon: "❌",  color: "bg-red-100 text-red-700"     },
  signature_pending:          { label: "Marked Pending",     icon: "⏳",  color: "bg-yellow-100 text-yellow-700"},
  sign_link_generated:        { label: "Sign Link Sent",     icon: "🔗",  color: "bg-purple-100 text-purple-700"},
  public_signature_submitted: { label: "Externally Signed",  icon: "🌐",  color: "bg-rose-100 text-rose-700"   },
};

export default function AuditTrail() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/signatures/audit/${documentId}`);
        setLogs(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load audit trail");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [documentId]);

  // Unique action types present in this log
  const actionTypes = ["All", ...new Set(logs.map((l) => l.action))];
  const filtered = filter === "All" ? logs : logs.filter((l) => l.action === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-rose-700 font-medium transition-colors mb-4 flex items-center gap-1">
            ← Back
          </button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
                Audit <span className="text-rose-800">Trail</span>
              </h1>
              <p className="text-gray-500 text-sm">Full activity log for this document</p>
            </div>
            {logs.length > 0 && (
              <span className="text-sm font-semibold text-gray-500 bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                {filtered.length} event{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* STATS */}
        {logs.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { key: "signature_placed",   label: "Placed",   icon: "✍",  color: "bg-blue-50 text-blue-700"   },
              { key: "signature_signed",   label: "Signed",   icon: "✅",  color: "bg-green-50 text-green-700" },
              { key: "signature_rejected", label: "Rejected", icon: "❌",  color: "bg-red-50 text-red-700"     },
            ].map((s) => (
              <div key={s.key} className={`${s.color} rounded-2xl p-3 flex items-center gap-2 shadow-sm cursor-pointer hover:opacity-80 transition-all`}
                onClick={() => setFilter(filter === s.key ? "All" : s.key)}>
                <span>{s.icon}</span>
                <div>
                  <p className="text-xl font-extrabold leading-none">
                    {logs.filter((l) => l.action === s.key).length}
                  </p>
                  <p className="text-xs font-medium opacity-70">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">

          {/* FILTER TABS */}
          {logs.length > 1 && (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 flex-wrap">
              {actionTypes.map((a) => {
                const cfg = ACTION_CONFIG[a];
                return (
                  <button
                    key={a}
                    onClick={() => setFilter(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      filter === a ? "bg-white text-rose-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {a === "All" ? "All" : (cfg?.label || a)}
                  </button>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 text-gray-400 py-12">
              <div className="w-8 h-8 border-4 border-rose-100 border-t-rose-700 rounded-full animate-spin" />
              <span className="text-sm">Loading audit trail…</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-rose-600 text-sm font-medium">{error}</div>
          )}

          {!loading && logs.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-600 font-semibold">No activity yet</p>
              <p className="text-gray-400 text-sm mt-1">Actions on this document will appear here.</p>
            </div>
          )}

          {!loading && logs.length > 0 && filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">No events of this type.</p>
          )}

          {!loading && filtered.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />

              <div className="space-y-4">
                {filtered.map((log, i) => {
                  const config = ACTION_CONFIG[log.action] || {
                    label: log.action, icon: "📌", color: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <div key={log.id || i} className="flex gap-4 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 z-10 ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 bg-gray-50 hover:bg-rose-50/30 border border-gray-100 hover:border-rose-100 rounded-2xl px-4 py-3 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{config.label}</p>
                            {log.metadata && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {log.metadata.name        && `Signer: ${log.metadata.name}`}
                                {log.metadata.signerEmail && ` · ${log.metadata.signerEmail}`}
                                {log.metadata.page        && ` · Page ${log.metadata.page}`}
                                {log.metadata.reason      && ` · Reason: ${log.metadata.reason}`}
                              </p>
                            )}
                            {log.ip_address && (
                              <p className="text-xs text-gray-300 mt-0.5">IP: {log.ip_address}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}