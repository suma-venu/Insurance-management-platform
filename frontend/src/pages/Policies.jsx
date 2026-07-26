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

  if (
    !customerId ||
    !policyType ||
    !policyNumber ||
    !premiumAmount ||
    !startDate ||
    !endDate ||
    !status
  ) {
    setMessage("Please fill in all fields.");
    return;
  }

  setMessage("Adding policy...");

 
 let error;

if (editingId) {
  const response = await supabase
    .from("policies")
    .update({
      customer_id: Number(customerId),
      policy_type: policyType,
      policy_number: Number(policyNumber),
      premium_amount: Number(premiumAmount),
      start_date: startDate,
      end_date: endDate,
      status: status,
    })
    .eq("id", editingId);

  error = response.error;
} else {
  const response = await supabase
    .from("policies")
    .insert([
      {
        customer_id: Number(customerId),
        policy_type: policyType,
        policy_number: Number(policyNumber),
        premium_amount: Number(premiumAmount),
        start_date: startDate,
        end_date: endDate,
        status: status,
      },
    ])
    .select();

  error = response.error;
}

  if (error) {
     console.log("Full Supabase error:", error);
    setMessage(error.message);
    return;
  }

  setMessage(
  editingId
    ? "Policy updated successfully."
    : "Policy created successfully."
);

  setCustomerId("");
  setPolicyType("");
  setPolicyNumber("");
  setPremiumAmount("");
  setStartDate("");
  setEndDate("");
  setStatus("Active");
  setEditingId(null);
  fetchPolicies();
}


  useEffect(() => {
    fetchCustomers();
     fetchPolicies();
  }, []);

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
            placeholder="Policy Number"
            value={policyNumber}
            onChange={(event) => setPolicyNumber(event.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            required
          />

          <input
            type="number"
            placeholder="Premium Amount"
            value={premiumAmount}
            onChange={(event) => setPremiumAmount(event.target.value)}
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
              {policies.map((policy) => (
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

              {policies.length === 0 && (
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
      </div>
    </div>
  </div>
);
}

export default Policies;