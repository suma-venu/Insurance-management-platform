import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Premiums() {
  const [policyId, setPolicyId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const [policies, setPolicies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function fetchPolicies() {
    const { data, error } = await supabase
      .from("policies")
      .select("id, policy_number, policy_type")
      .order("id", { ascending: true });


     console.log("Policies data:", data);
console.log("Policies error:", error);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPolicies(data ?? []);
  }

  async function fetchPayments() {
    const { data, error } = await supabase
      .from("premium_payments")
      .select(`
        *,
        policies(policy_number, policy_type)
      `)
      .order("id", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setPayments(data ?? []);
  }

  function calculateStatus(currentPaymentDate, currentDueDate) {
    if (currentPaymentDate) {
      return "Paid";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(currentDueDate);
    due.setHours(0, 0, 0, 0);

    return due < today ? "Overdue" : "Pending";
  }

  async function handleSavePayment(event) {
    event.preventDefault();

    if (!policyId || !dueDate || !amount) {
      setMessage("Please fill in policy, due date, and amount.");
      return;
    }

    const calculatedStatus = calculateStatus(paymentDate, dueDate);

    const paymentData = {
      policy_id: Number(policyId),
      payment_date: paymentDate || null,
      due_date: dueDate,
      amount: Number(amount),
      payment_status: calculatedStatus,
    };

    let error;

    if (editingId) {
      const response = await supabase
        .from("premium_payments")
        .update(paymentData)
        .eq("id", editingId);

      error = response.error;
    } else {
      const response = await supabase
        .from("premium_payments")
        .insert([paymentData])
        .select();

      error = response.error;
    }

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      editingId
        ? "Payment updated successfully."
        : "Payment recorded successfully."
    );

    setPolicyId("");
    setPaymentDate("");
    setDueDate("");
    setAmount("");
    setPaymentStatus("Pending");
    setEditingId(null);

    fetchPayments();
  }

  function handleEditPayment(payment) {
    setEditingId(payment.id);
    setPolicyId(payment.policy_id);
    setPaymentDate(payment.payment_date ?? "");
    setDueDate(payment.due_date ?? "");
    setAmount(payment.amount);
    setPaymentStatus(payment.payment_status);
    setMessage("Editing payment.");
  }

  async function handleMarkPaid(payment) {
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("premium_payments")
      .update({
        payment_date: today,
        payment_status: "Paid",
      })
      .eq("id", payment.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Payment marked as paid.");
    fetchPayments();
  }

 useEffect(() => {
  async function loadData() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("SESSION:", session);
    console.log("USER ROLE:", session?.user?.role);

    await fetchPolicies();
    await fetchPayments();
  }

  loadData();
}, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Premium Tracking
            </h1>

            <p className="mt-1 text-slate-600">
              Record payments, track due dates, and identify overdue premiums.
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
            {editingId ? "Update Premium Payment" : "Record Premium Payment"}
          </h2>

          <form
            onSubmit={handleSavePayment}
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
              placeholder="Amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              required
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Payment Date
              </label>

              <input
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
              Status is calculated automatically:
              payment date entered = Paid, past due date = Overdue, otherwise Pending.
            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 md:col-span-2"
            >
              {editingId ? "Update Payment" : "Record Payment"}
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
            Payment History
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-sm text-slate-600">
                  <th className="px-4 py-3">Policy</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => {
                  const displayStatus = calculateStatus(
                    payment.payment_date,
                    payment.due_date
                  );

                  return (
                    <tr
                      key={payment.id}
                      className="border-b text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        Policy #{payment.policies?.policy_number ?? payment.policy_id}
                        <div className="text-xs text-slate-500">
                          {payment.policies?.policy_type}
                        </div>
                      </td>

                      <td className="px-4 py-3">₹{payment.amount}</td>
                      <td className="px-4 py-3">
                        {payment.payment_date || "Not paid"}
                      </td>
                      <td className="px-4 py-3">{payment.due_date}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            displayStatus === "Paid"
                              ? "bg-green-100 text-green-700"
                              : displayStatus === "Overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditPayment(payment)}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-white hover:bg-amber-600"
                          >
                            Edit
                          </button>

                          {displayStatus !== "Paid" && (
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(payment)}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {payments.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No premium payments found.
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

export default Premiums;