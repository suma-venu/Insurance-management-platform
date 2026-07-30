import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-200 p-6">
      <div className="rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 text-3xl font-bold text-red-600">
          Access Denied
        </h1>

        <p className="mb-6 text-slate-600">
          You do not have permission to access this page.
        </p>

        <Link
          to="/customer-dashboard"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;