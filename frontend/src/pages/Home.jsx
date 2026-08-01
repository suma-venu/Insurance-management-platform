import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">

        <span className="mb-5 rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
          Insurance Management Platform
        </span>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-slate-800 md:text-6xl">
          Simplify Insurance Management with One Smart Platform
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          Efficiently manage customers, insurance policies, premium payments,
          claims, documents, and reports through a secure, modern, and
          user-friendly web application.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/login"
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Register
          </Link>
        </div>

        <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-3 text-4xl">👥</div>
            <h3 className="text-lg font-bold text-slate-800">
              Customer Management
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Register, update, search, and manage customer information
              efficiently.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-3 text-4xl">📄</div>
            <h3 className="text-lg font-bold text-slate-800">
              Policy & Claims
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Create insurance policies, process claims, and monitor their
              current status.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-3 text-4xl">📊</div>
            <h3 className="text-lg font-bold text-slate-800">
              Reports & Analytics
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Track premium collections, customer growth, and insurance
              statistics with interactive reports.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Home;