import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUS_CONFIG = {
  Pending:  { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "⏳" },
  Signed:   { color: "bg-green-100 text-green-700 border-green-200",   icon: "✅" },
  Rejected: { color: "bg-red-100 text-red-700 border-red-200",         icon: "❌" },
};

export default function SignatureManager() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  // Send link modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sendName, setSendName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Reject modal
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Generate PDF
  const [generating, setGenerating] = useState(false);

  const fetchSignatures = async () => {
    try {
      const res = await api.get(`/signatures/${documentId}`);
      setSignatures(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load signatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSignatures(); }, [documentId]);

  const updateStatus = async (id, status, reason = "") => {
    try {
      await api.patch(`/signatures/${id}/status`, { status, reason });
      setSignatures((prev) =>
        prev.map((s) => s.id === id ? { ...s, status, rejection_reason: reason } : s)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleSendLink = async () => {
    if (!sendEmail.trim()) return alert("Email is required");
    try {
      setSending(true);
      const res = await api.post(`/signatures/${documentId}/send-link`, {
        signerEmail: sendEmail,
        signerName: sendName,
      });
      setSendResult(res.data.signUrl);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send link");
    } finally {
      setSending(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      setGenerating(true);
      const res = await api.post(`/docs/${documentId}/generate`);
      window.open(res.data.url, "_blank");
      alert("✅ Signed PDF generated! Document marked as completed.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate signed PDF");
    } finally {
      setGenerating(false);
    }
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setSendEmail("");
    setSendName("");
    setSendResult(null);
  };

  const counts = {
    All:      signatures.length,
    Pending:  signatures.filter((s) => s.status === "Pending").length,
    Signed:   signatures.filter((s) => s.status === "Signed").length,
    Rejected: signatures.filter((s) => s.status === "Rejected").length,
  };

  const filtered = filter === "All"
    ? signatures
    : signatures.filter((s) => s.status === filter);

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
                Signature <span className="text-rose-800">Manager</span>
              </h1>
              <p className="text-gray-500 text-sm">Manage signatures and send signing requests</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => navigate(`/audit/${documentId}`)}
                className="px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
              >
                📋 Audit Trail
              </button>
              <button
                onClick={() => setShowSendModal(true)}
                className="px-4 py-2 text-sm font-semibold bg-rose-800 hover:bg-rose-900 text-white rounded-xl shadow-lg shadow-rose-900/20 transition-all"
              >
                🔗 Send Sign Link
              </button>
              {signatures.some((s) => s.status === "Signed") && (
                <button
                  onClick={handleGeneratePdf}
                  disabled={generating}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all text-white shadow-lg ${
                    generating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800 shadow-green-900/20"
                  }`}
                >
                  {generating ? "Generating…" : "⬇ Generate Signed PDF"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* STATS PILLS */}
        {signatures.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Pending",  count: counts.Pending,  color: "bg-yellow-50 text-yellow-700", icon: "⏳" },
              { label: "Signed",   count: counts.Signed,   color: "bg-green-50 text-green-700",   icon: "✅" },
              { label: "Rejected", count: counts.Rejected, color: "bg-red-50 text-red-700",       icon: "❌" },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-2xl p-3 flex items-center gap-2 shadow-sm`}>
                <span>{s.icon}</span>
                <div>
                  <p className="text-xl font-extrabold leading-none">{s.count}</p>
                  <p className="text-xs font-medium opacity-70">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SIGNATURES LIST */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-sm">✍</span>
              Signatures
              {signatures.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-normal normal-case">
                  {filtered.length}/{signatures.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-3">
              {signatures.length > 0 && (
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                  {["All", "Pending", "Signed", "Rejected"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        filter === f
                          ? "bg-white text-rose-800 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {f} {counts[f] > 0 && f !== "All" ? `(${counts[f]})` : ""}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={fetchSignatures}
                className="text-xs text-gray-400 hover:text-rose-700 underline font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 text-gray-400 py-12">
              <div className="w-8 h-8 border-4 border-rose-100 border-t-rose-700 rounded-full animate-spin" />
            </div>
          )}

          {error && <p className="text-rose-600 text-sm text-center py-6">{error}</p>}

          {!loading && signatures.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="text-5xl mb-4">✍</div>
              <p className="text-gray-600 font-semibold">No signatures yet</p>
              <p className="text-gray-400 text-sm mt-1">Send a signing link or place a signature on the PDF.</p>
            </div>
          )}

          {!loading && signatures.length > 0 && filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">No {filter} signatures.</p>
          )}

          <div className="space-y-3">
            {filtered.map((sig) => {
              const statusCfg = STATUS_CONFIG[sig.status] || STATUS_CONFIG.Pending;
              return (
                <div
                  key={sig.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 gap-3 hover:border-rose-100 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-800 font-bold flex-shrink-0 text-sm">
                      {sig.signer_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{sig.signer_name || "Unknown"}</p>
                      <p className="text-xs text-gray-400">
                        Page {sig.page_number} · {new Date(sig.signed_at || sig.created_at).toLocaleString()}
                      </p>
                      {sig.ip_address && (
                        <p className="text-xs text-gray-300 mt-0.5">IP: {sig.ip_address}</p>
                      )}
                      {sig.rejection_reason && (
                        <p className="text-xs text-red-500 mt-0.5">Reason: {sig.rejection_reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusCfg.color}`}>
                      {statusCfg.icon} {sig.status}
                    </span>
                    {sig.status !== "Signed" && (
                      <button
                        onClick={() => updateStatus(sig.id, "Signed")}
                        className="text-xs font-bold px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full transition-all"
                      >
                        Mark Signed
                      </button>
                    )}
                    {sig.status !== "Rejected" && (
                      <button
                        onClick={() => { setRejectModal({ id: sig.id }); setRejectReason(""); }}
                        className="text-xs font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-full transition-all"
                      >
                        Reject
                      </button>
                    )}
                    {sig.status !== "Pending" && (
                      <button
                        onClick={() => updateStatus(sig.id, "Pending")}
                        className="text-xs font-bold px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full transition-all"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SEND LINK MODAL */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            {!sendResult ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Send Signing Link</h3>
                <p className="text-gray-500 text-sm mb-6">The signer will receive a secure email link.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Signer Email *</label>
                    <input
                      type="email"
                      placeholder="signer@example.com"
                      value={sendEmail}
                      onChange={(e) => setSendEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Signer Name</label>
                    <input
                      type="text"
                      placeholder="e.g: Srinidhi Kulkarni"
                      value={sendName}
                      onChange={(e) => setSendName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 outline-none text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={closeSendModal}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSendLink} disabled={sending}
                    className={`flex-1 py-3 rounded-xl text-white font-bold transition-all ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-rose-800 hover:bg-rose-900"}`}>
                    {sending ? "Sending…" : "Send Link"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-3">🔗</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Link Generated!</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Email sent to <strong>{sendEmail}</strong>. Share the link directly:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-600 break-all text-left mb-4">
                  {sendResult}
                </div>
                <button onClick={() => navigator.clipboard.writeText(sendResult)}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-sm transition-all mb-3">
                  📋 Copy Link
                </button>
                <button onClick={closeSendModal}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Reject Signature</h3>
            <p className="text-gray-500 text-sm mb-4">Optionally provide a reason for rejection.</p>
            <textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 outline-none text-sm transition-all resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                onClick={() => { updateStatus(rejectModal.id, "Rejected", rejectReason); setRejectModal(null); }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}