import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function Policies() {
  const [customerId, setCustomerId] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Active");

  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

const [search, setSearch] = useState("");
const [filterStatus, setFilterStatus] = useState("All");
const [currentPage, setCurrentPage] = useState(1);

const policiesPerPage = 5;

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setCustomers(data);
  }

async function fetchPolicies() {
  const { data, error } = await supabase
    .from("policies")
    .select("*");

  if (error) {
    setMessage(error.message);
    console.log(error.message);
    return;
  }

  console.log(data);
  setPolicies(data);
}

function handleEditPolicy(policy) {
  setEditingId(policy.id);

  setCustomerId(policy.customer_id);
  setPolicyType(policy.policy_type);
  setPolicyNumber(policy.policy_number);
  setPremiumAmount(policy.premium_amount);
  setStartDate(policy.start_date);
  setEndDate(policy.end_date);
  setStatus(policy.status);

  setMessage("Editing policy...");
}

async function handleCancelPolicy(policyId) {
  const { error } = await supabase
    .from("policies")
    .update({ status: "Cancelled" })
    .eq("id", policyId);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Policy cancelled successfully.");
  fetchPolicies();
}

async function handleRenewPolicy(policyId) {
  const today = new Date();

  const start = today.toISOString().split("T")[0];

  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const end = nextYear.toISOString().split("T")[0];

  const { error } = await supabase
    .from("policies")
    .update({
      start_date: start,
      end_date: end,
      status: "Active",
    })
    .eq("id", policyId);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Policy renewed successfully.");
  fetchPolicies();
}

async function handleAddPolicy(event) {
  event.preventDefault();

  const trimmedPolicyType = policyType.trim();
  const premiumValue = Number(premiumAmount);

  if (
    !customerId ||
    !trimmedPolicyType ||
    !premiumAmount ||
    !startDate ||
    !endDate ||
    !status
  ) {
    setMessage("Please fill in all fields.");
    return;
  }

  if (premiumValue <= 0) {
    setMessage("Premium amount must be greater than 0.");
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    setMessage("End date must be after the start date.");
    return;
  }

  setMessage(editingId ? "Updating policy..." : "Adding policy...");

  let finalPolicyNumber;

  if (editingId) {
    const currentPolicy = policies.find(
      (policy) => policy.id === editingId
    );

    if (!currentPolicy) {
      setMessage("Unable to find the policy being edited.");
      return;
    }

    // Keep the existing policy number while editing
    finalPolicyNumber = Number(currentPolicy.policy_number);
  } else {
    // Find the highest existing policy number
    const { data: lastPolicy, error: numberError } = await supabase
      .from("policies")
      .select("policy_number")
      .order("policy_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (numberError) {
      console.error("Policy-number generation error:", numberError);
      setMessage("Unable to generate a policy number.");
      return;
    }

    // Start from 100001 when no policy exists
    finalPolicyNumber = lastPolicy
      ? Number(lastPolicy.policy_number) + 1
      : 100001;
  }

  const policyData = {
    customer_id: Number(customerId),
    policy_type: trimmedPolicyType,
    policy_number: finalPolicyNumber,
    premium_amount: premiumValue,
    start_date: startDate,
    end_date: endDate,
    status: status,
  };

  let error;

  if (editingId) {
    const response = await supabase
      .from("policies")
      .update(policyData)
      .eq("id", editingId);

    error = response.error;
  } else {
    const response = await supabase
      .from("policies")
      .insert([policyData])
      .select();

    error = response.error;
  }

  if (error) {
    console.error("Policy save error:", error);

    if (error.code === "23505") {
      setMessage("This policy number already exists. Please try again.");
    } else {
      setMessage("Unable to save the policy. Please try again.");
    }

    return;
  }

  setMessage(
    editingId
      ? "Policy updated successfully."
      : `Policy created successfully. Policy number: ${finalPolicyNumber}`
  );

  setCustomerId("");
  setPolicyType("");
  setPolicyNumber("");
  setPremiumAmount("");
  setStartDate("");
  setEndDate("");
  setStatus("Active");
  setEditingId(null);

  await fetchPolicies();
}

  useEffect(() => {
    fetchCustomers();
     fetchPolicies();
  }, []);

  const filteredPolicies = policies.filter((policy) => {
  const matchesSearch =
    policy.policy_type
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    policy.policy_number
      .toString()
      .includes(search);

  const matchesStatus =
    filterStatus === "All" ||
    policy.status === filterStatus;

  return matchesSearch && matchesStatus;
});

const lastPolicy = currentPage * policiesPerPage;
const firstPolicy = lastPolicy - policiesPerPage;

const currentPolicies = filteredPolicies.slice(
  firstPolicy,
  lastPolicy
);

const totalPages = Math.ceil(
  filteredPolicies.length / policiesPerPage
);

 return (
  <div className="min-h-screen bg-blue-300 p-6">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Policy Management
          </h1>

          <p className="mt-1 text-slate-600">
            Create, update, renew, and cancel insurance policies.
          </p>
        </div>

        <Link
          to="/customer-dashboard"
          className="inline-flex w-fit items-center rounded-lg bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-semibold text-slate-700">
          {editingId ? "Update Policy" : "Create Policy"}
        </h2>

        <form
          onSubmit={handleAddPolicy}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <select
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
            required
          >
            <option value="">Select Customer</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Policy Type"
            value={policyType}
            onChange={(event) => setPolicyType(event.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            required
          />

          

          <input
            type="number"
            placeholder="Premium Amount"
            value={premiumAmount}
            onChange={(event) => setPremiumAmount(event.target.value)}
             min="1"
             step="0.01"
            className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500 md:col-span-2"
            required
          >
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 md:col-span-2"
          >
            {editingId ? "Update Policy" : "Add Policy"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm font-medium text-slate-700">
            {message}
          </p>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-semibold text-slate-700">
          Policy List
        </h2>

        <div className="mb-4 flex flex-col gap-3 md:flex-row">

  <input
    type="text"
    placeholder="Search policy..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setCurrentPage(1);
    }}
    className="rounded-lg border p-3"
  />

  <select
    value={filterStatus}
    onChange={(e) => {
      setFilterStatus(e.target.value);
      setCurrentPage(1);
    }}
    className="rounded-lg border p-3"
  >
    <option>All</option>
    <option>Active</option>
    <option>Expired</option>
    <option>Cancelled</option>
  </select>

</div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-250 border-collapse text-left">
            <thead>
              <tr className="border-b bg-slate-50 text-sm text-slate-600">
                <th className="px-4 py-3">Customer ID</th>
                <th className="px-4 py-3">Policy Type</th>
                <th className="px-4 py-3">Policy Number</th>
                <th className="px-4 py-3">Premium</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
             {currentPolicies.map((policy) => (
                <tr
                  key={policy.id}
                  className="border-b text-sm text-slate-700 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">{policy.customer_id}</td>
                  <td className="px-4 py-3">{policy.policy_type}</td>
                  <td className="px-4 py-3">{policy.policy_number}</td>
                  <td className="px-4 py-3">
                    ₹{policy.premium_amount}
                  </td>
                  <td className="px-4 py-3">{policy.start_date}</td>
                  <td className="px-4 py-3">{policy.end_date}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        policy.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : policy.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {policy.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditPolicy(policy)}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 font-medium text-white hover:bg-amber-600"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancelPolicy(policy.id)}
                        disabled={policy.status === "Cancelled"}
                        className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRenewPolicy(policy.id)}
                        className="rounded-lg bg-green-600 px-3 py-1.5 font-medium text-white hover:bg-green-700"
                      >
                        Renew
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentPolicies.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No policies found.
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

export default Policies;