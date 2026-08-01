import { Link } from "react-router-dom";

function CustomerDashboard() {
  const modules = [
    {
      title: "Customer Management",
      description: "Register, search, view, edit, and manage customer records.",
      path: "/customers",
      icon: "👥",
    },
    {
      title: "Policy Management",
      description: "Create, renew, update, and monitor insurance policies.",
      path: "/policies",
      icon: "📄",
    },
    {
      title: "Premium Tracking",
      description: "Record premium payments and track due or overdue amounts.",
      path: "/premiums",
      icon: "💳",
    },
    {
      title: "Claim Management",
      description: "Submit, review, approve, or reject insurance claims.",
      path: "/claims",
      icon: "📋",
    },
    {
      title: "Document Management",
      description: "Upload, download, and manage customer documents.",
      path: "/documents",
      icon: "📁",
    },
    {
      title: "Reports Dashboard",
      description: "View policy, claim, premium, and customer analytics.",
      path: "/reports",
      icon: "📊",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Insurance Management Platform
          </p>

          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            Management Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Manage customers, insurance policies, premium payments, claims,
            documents, and reports from one place.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Management Modules
          </h2>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {modules.length} modules
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl transition group-hover:bg-blue-600">
                <span className="group-hover:scale-110">
                  {module.icon}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 transition group-hover:text-blue-700">
                {module.title}
              </h3>

              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                {module.description}
              </p>

              <div className="mt-5 flex items-center font-semibold text-blue-600">
                Open module
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;