import { Link } from "react-router-dom";

function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-800">
          Customer Dashboard
        </h1>

        <p className="mb-8 text-slate-600">
          Access customer, policy, premium, claim, and document modules.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/customers"
            className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-blue-700">
              Customer Management
            </h2>
          </Link>

          <Link
            to="/policies"
            className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-blue-700">
              Policy Management
            </h2>
          </Link>

          <Link
  to="/premiums"
  className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
>
  <h2 className="text-xl font-semibold text-blue-700">
    Premium Tracking
  </h2>
</Link>

<Link
  to="/claims"
  className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
>
  <h2 className="text-xl font-semibold text-blue-700">
    Claim Management
  </h2>
</Link>

<Link
  to="/documents"
  className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
>
  <h2 className="text-xl font-semibold text-blue-700">
    Document Management
  </h2>
</Link>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;