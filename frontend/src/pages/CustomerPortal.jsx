import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function CustomerPortal() {
  const [policies, setPolicies] = useState([]);
  const [message, setMessage] = useState("Loading your policy details...");

  useEffect(() => {
    fetchCustomerPolicies();
  }, []);

  async function fetchCustomerPolicies() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in again.");
      return;
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, name")
      .eq("email", user.email)
      .maybeSingle();

    if (customerError) {
      setMessage(customerError.message);
      return;
    }

    if (!customer) {
      setMessage(
        "No customer profile is linked to this login email."
      );
      return;
    }

    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("customer_id", customer.id)
      .order("end_date", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setPolicies(data || []);
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-sky-200 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-700">
          My Insurance
        </h1>

        <p className="mb-6 text-slate-600">
          View your policy details, status, and due dates.
        </p>

        {message && (
          <div className="rounded-xl bg-white p-5 text-slate-700 shadow">
            {message}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-blue-700">
                  {policy.policy_type}
                </h2>

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
              </div>

              <div className="space-y-3 text-slate-700">
                <p>
                  <strong>Policy Number:</strong>{" "}
                  {policy.policy_number}
                </p>

                <p>
                  <strong>Premium Amount:</strong>{" "}
                  ₹{policy.premium_amount}
                </p>

                <p>
                  <strong>Start Date:</strong>{" "}
                  {policy.start_date}
                </p>

                <p>
                  <strong>End Date:</strong>{" "}
                  {policy.end_date}
                </p>

                <p>
                  <strong>Due Date:</strong>{" "}
                  {policy.end_date}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!message && policies.length === 0 && (
          <div className="rounded-xl bg-white p-5 text-slate-600 shadow">
            No policy details were found for your account.
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerPortal;