import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-100">

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">

        <h1 className="mb-6 text-5xl font-bold text-blue-700">
          Insurance Management Platform
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-slate-600">
          Manage insurance customers, policies, premium payments,
          claims and documents from one secure platform.
        </p>

        <div className="flex gap-5">

          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg border border-blue-600 px-8 py-3 text-blue-600 hover:bg-blue-50"
          >
            Register
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Home;