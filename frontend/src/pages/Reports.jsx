import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { supabase } from "../lib/supabase";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Reports() {
  const [report, setReport] = useState({
    customers: 0,
    activePolicies: 0,
    expiredPolicies: 0,
    cancelledPolicies: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    premiumCollected: 0,
    uploadedDocuments: 0,
  });

  const [message, setMessage] = useState("");

  async function fetchReportData() {
    setMessage("Loading reports...");

    const [
      customersResult,
      policiesResult,
      claimsResult,
      paymentsResult,
      documentsResult,
    ] = await Promise.all([
      supabase.from("customers").select("id"),
      supabase.from("policies").select("status"),
      supabase.from("claims").select("status"),
      supabase
        .from("premium_payments")
        .select("amount, payment_status"),
      supabase.from("documents").select("id"),
    ]);

    const firstError =
      customersResult.error ||
      policiesResult.error ||
      claimsResult.error ||
      paymentsResult.error ||
      documentsResult.error;

    if (firstError) {
      setMessage(firstError.message);
      return;
    }

    const policies = policiesResult.data ?? [];
    const claims = claimsResult.data ?? [];
    const payments = paymentsResult.data ?? [];

    const premiumCollected = payments
      .filter((payment) => payment.payment_status === "Paid")
      .reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
      );

    setReport({
      customers: customersResult.data?.length ?? 0,

      activePolicies: policies.filter(
        (policy) => policy.status === "Active"
      ).length,

      expiredPolicies: policies.filter(
        (policy) => policy.status === "Expired"
      ).length,

      cancelledPolicies: policies.filter(
        (policy) => policy.status === "Cancelled"
      ).length,

      pendingClaims: claims.filter(
        (claim) => claim.status === "Pending"
      ).length,

      approvedClaims: claims.filter(
        (claim) => claim.status === "Approved"
      ).length,

      rejectedClaims: claims.filter(
        (claim) => claim.status === "Rejected"
      ).length,

      premiumCollected,

      uploadedDocuments: documentsResult.data?.length ?? 0,
    });

    setMessage("");
  }

  useEffect(() => {
    fetchReportData();
  }, []);

  const policyChartData = {
    labels: ["Active", "Expired", "Cancelled"],
    datasets: [
      {
        label: "Policies",
        data: [
          report.activePolicies,
          report.expiredPolicies,
          report.cancelledPolicies,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const claimChartData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        label: "Claims",
        data: [
          report.pendingClaims,
          report.approvedClaims,
          report.rejectedClaims,
        ],
        backgroundColor: [
          "rgba(245, 158, 11, 0.7)",
          "rgba(34, 197, 94, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const premiumChartData = {
    labels: ["Premium Collected"],
    datasets: [
      {
        label: "Amount",
        data: [report.premiumCollected],
        backgroundColor: "rgba(37, 99, 235, 0.7)",
      },
    ],
  };

  const summaryCards = [
  {
    title: "Total Customers",
    value: report.customers,
    color: "border-blue-500",
  },
  {
    title: "Active Policies",
    value: report.activePolicies,
    color: "border-green-500",
  },
  {
    title: "Expired Policies",
    value: report.expiredPolicies,
    color: "border-yellow-500",
  },
  {
    title: "Cancelled Policies",
    value: report.cancelledPolicies,
    color: "border-red-500",
  },
  {
    title: "Pending Claims",
    value: report.pendingClaims,
    color: "border-amber-500",
  },
  {
    title: "Approved Claims",
    value: report.approvedClaims,
    color: "border-green-500",
  },
  {
    title: "Rejected Claims",
    value: report.rejectedClaims,
    color: "border-red-500",
  },
  {
    title: "Premium Collected",
    value: `₹${report.premiumCollected.toLocaleString("en-IN")}`,
    color: "border-indigo-500",
  },
  {
    title: "Uploaded Documents",
    value: report.uploadedDocuments,
    color: "border-purple-500",
  },
];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Reports Dashboard
            </h1>

            <p className="mt-1 text-slate-600">
              View insurance business statistics and performance.
            </p>
          </div>

          <Link
            to="/customer-dashboard"
            className="inline-flex w-fit rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

       {message && (
  <div
    className={`mb-5 rounded-lg border px-4 py-3 text-sm font-medium ${
      message.toLowerCase().includes("loading")
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    {message}
  </div>
)}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border-l-4 ${card.color} bg-white p-6 shadow transition hover:shadow-lg`}
            >
              <p className="text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-semibold text-slate-700">
              Policy Status
            </h2>

            <div className="mx-auto max-w-md">
              <Doughnut data={policyChartData} />
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-semibold text-slate-700">
              Claim Status
            </h2>

            <div className="mx-auto max-w-md">
              <Doughnut data={claimChartData} />
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="mb-5 text-xl font-semibold text-slate-700">
              Premium Collection
            </h2>

            <div className="h-80">
              <Bar
                data={premiumChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;