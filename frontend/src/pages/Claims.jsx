import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Claims() {
  const [policyId, setPolicyId] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("Pending");
  const [submissionDate, setSubmissionDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
const [filterStatus, setFilterStatus] = useState("All");
const [currentPage, setCurrentPage] = useState(1);

const claimsPerPage = 5;

  async function fetchPolicies() {
    const { data, error } = await supabase
      .from("policies")
      .select("id, policy_number, policy_type")
      .order("id", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setPolicies(data ?? []);
  }

  async function fetchClaims() {
    const { data, error } = await supabase
      .from("claims")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setClaims(data ?? []);
  }

  async function handleSaveClaim(event) {
  event.preventDefault();

  const amountValue = Number(claimAmount);
  const trimmedReason = reason.trim();
  const trimmedRemarks = remarks.trim();

  if (
    !policyId ||
    !claimAmount ||
    !trimmedReason ||
    !submissionDate
  ) {
    setMessage("Please fill in all required fields.");
    return;
  }

  if (amountValue <= 0) {
    setMessage("Claim amount must be greater than 0.");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const submitted = new Date(submissionDate);
  submitted.setHours(0, 0, 0, 0);

  if (submitted > today) {
    setMessage("Submission date cannot be in the future.");
    return;
  }

  const claimData = {
    policy_id: Number(policyId),
    claim_amount: amountValue,
    reason: trimmedReason,
    status,
    submission_date: submissionDate,
    remarks: trimmedRemarks,
  };

  let error;

  if (editingId) {
    const response = await supabase
      .from("claims")
      .update(claimData)
      .eq("id", editingId);

    error = response.error;
  } else {
    const response = await supabase
      .from("claims")
      .insert([claimData])
      .select();

    error = response.error;
  }

  if (error) {
    console.error("Claim error:", error);
    setMessage("Unable to save the claim. Please try again.");
    return;
  }

  setMessage(
    editingId
      ? "Claim updated successfully."
      : "Claim submitted successfully."
  );

  setPolicyId("");
  setClaimAmount("");
  setReason("");
  setStatus("Pending");
  setSubmissionDate("");
  setRemarks("");
  setEditingId(null);

  await fetchClaims();
}

  function handleEditClaim(claim) {
    setEditingId(claim.id);
    setPolicyId(claim.policy_id);
    setClaimAmount(claim.claim_amount);
    setReason(claim.reason);
    setStatus(claim.status);
    setSubmissionDate(claim.submission_date);
    setRemarks(claim.remarks ?? "");
    setMessage("Editing claim.");
  }

  async function handleClaimStatus(claimId, newStatus) {
    const { error } = await supabase
      .from("claims")
      .update({ status: newStatus })
      .eq("id", claimId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`Claim ${newStatus.toLowerCase()} successfully.`);
    fetchClaims();
  }

  useEffect(() => {
    fetchPolicies();
    fetchClaims();
  }, []);

  const filteredClaims = claims.filter((claim) => {
  const policy = policies.find(
    (item) => item.id === claim.policy_id
  );

  const matchesSearch =
    claim.reason.toLowerCase().includes(search.toLowerCase()) ||
    policy?.policy_number?.toString().includes(search);

  const matchesStatus =
    filterStatus === "All" ||
    claim.status === filterStatus;

  return matchesSearch && matchesStatus;
});

const lastClaim = currentPage * claimsPerPage;
const firstClaim = lastClaim - claimsPerPage;

const currentClaims = filteredClaims.slice(
  firstClaim,
  lastClaim
);

const totalPages = Math.ceil(
  filteredClaims.length / claimsPerPage
);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Claim Management
            </h1>
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
  <input
    type="text"
    placeholder="Search by policy number or reason..."
    value={search}
    onChange={(event) => {
      setSearch(event.target.value);
      setCurrentPage(1);
    }}
    className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
  />

  <select
    value={filterStatus}
    onChange={(event) => {
      setFilterStatus(event.target.value);
      setCurrentPage(1);
    }}
    className="rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-blue-500"
  >
    <option value="All">All Statuses</option>
    <option value="Pending">Pending</option>
    <option value="Approved">Approved</option>
    <option value="Rejected">Rejected</option>
  </select>
</div>

            <p className="mt-1 text-slate-600">
              Submit, review, approve, and reject insurance claims.
            </p>
          </div>

          <Link
            to="/customer-dashboard"
            className="inline-flex w-fit rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-slate-700">
            {editingId ? "Update Claim" : "Submit Claim"}
          </h2>

          <form
            onSubmit={handleSaveClaim}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <select
              value={policyId}
              onChange={(event) => setPolicyId(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Policy</option>

              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  Policy #{policy.policy_number} - {policy.policy_type}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Claim Amount"
              value={claimAmount}
              onChange={(event) => setClaimAmount(event.target.value)}
               min="1"
               step="0.01"
              className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              required
            />

            <input
              type="text"
              placeholder="Reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              required
            />

            <input
              type="date"
              value={submissionDate}
              onChange={(event) => setSubmissionDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              required
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <input
              type="text"
              placeholder="Remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 md:col-span-2"
            >
              {editingId ? "Update Claim" : "Submit Claim"}
            </button>
          </form>

          {message && (
  <div
    className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
      message.toLowerCase().includes("submitted") ||
      message.toLowerCase().includes("updated") ||
      message.toLowerCase().includes("approved") ||
      message.toLowerCase().includes("rejected")
        ? "border-green-200 bg-green-50 text-green-700"
        : message.toLowerCase().includes("editing")
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    {message}
  </div>
)}
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-slate-700">
            Claim History
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-sm text-slate-600">
                  <th className="px-4 py-3">Policy</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="border-b text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                     
                     
  Policy #
  {policies.find(
    (policy) => policy.id === claim.policy_id
  )?.policy_number || claim.policy_id}

  <div className="text-xs text-slate-500">
    {policies.find(
      (policy) => policy.id === claim.policy_id
    )?.policy_type || ""}
  </div>



                    </td>

                    <td className="px-4 py-3">
                      ₹{claim.claim_amount}
                    </td>

                    <td className="px-4 py-3">{claim.reason}</td>
                    <td className="px-4 py-3">{claim.submission_date}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          claim.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : claim.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {claim.remarks || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClaim(claim)}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-white hover:bg-amber-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleClaimStatus(claim.id, "Approved")
                          }
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleClaimStatus(claim.id, "Rejected")
                          }
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentClaims.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-center gap-2">
  <button
    type="button"
    onClick={() =>
      setCurrentPage((page) => Math.max(page - 1, 1))
    }
    disabled={currentPage === 1}
    className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-300"
  >
    Previous
  </button>

  <span className="px-4 py-2">
    {currentPage} / {totalPages || 1}
  </span>

  <button
    type="button"
    onClick={() =>
      setCurrentPage((page) =>
        Math.min(page + 1, totalPages)
      )
    }
    disabled={currentPage === totalPages || totalPages === 0}
    className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-300"
  >
    Next
  </button>
</div>
        </div>
      </div>
    </div>
  );
}

export default Claims;
