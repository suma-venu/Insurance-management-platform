import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";


function Navbar() {
const navigate = useNavigate();

async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (!error) {
    navigate("/login");
  }
}
  return (
  

    <nav className="bg-blue-700 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-xl font-bold text-white">
          Insurance Management Platform
        </h1>

        <div className="flex gap-5">
        <Link to="/" className="text-white hover:text-blue-200">
  Home
</Link>

          


          <Link to="/login" className="text-white hover:text-blue-200">
            Login
          </Link>

          <Link to="/register" className="text-white hover:text-blue-200">
            Register
          </Link>

          <button
  onClick={handleLogout}
  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
>
  Logout
</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;