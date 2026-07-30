import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Navbar from "./components/Navbar";
import Home from"./pages/Home";
import Login from "./pages/Login";
import Register from"./pages/Register";
import Customers from"./pages/Customers";
import Policies from"./pages/Policies";
import Dashboard from "./pages/Dashboard";
import Premiums from"./pages/Premiums";
import Claims from"./pages/Claims";
import Documents from "./pages/Documents";
import Reports from"./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import CustomerPortal from "./pages/CustomerPortal";






function App(){
const [user, setUser] = useState(null);


useEffect(() => {
  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  getCurrentUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);



return (
<BrowserRouter>
 <Navbar />
       <Routes>
         <Route path="/" element={<Home />} />
           <Route path="/login" element={<Login/>}/>
           <Route path="/register" element={<Register/>}/>

           <Route
  path="/customers"
  element={
    <ProtectedRoute user={user} allowedRoles={["admin", "agent"]}>
      <Customers />
    </ProtectedRoute>
  }
/>


<Route
  path="/customer-portal"
  element={
    <ProtectedRoute user={user} allowedRoles={["customer"]}>
      <CustomerPortal />
    </ProtectedRoute>
  }
/>
           <Route
  path="/policies"
  element={
    <ProtectedRoute user={user} allowedRoles={["admin", "agent"]}>
      <Policies />
    </ProtectedRoute>
  }
/>
           <Route
  path="/customer-dashboard"
  element={
    <ProtectedRoute
      user={user}
      allowedRoles={["admin", "agent"]}
    >
      <Dashboard />
    </ProtectedRoute>
  }
/>

            <Route
  path="/premiums"
  element={
    <ProtectedRoute user={user} allowedRoles={["admin", "agent"]}>
      <Premiums />
    </ProtectedRoute>
  }
/>
           <Route
  path="/claims"
  element={
    <ProtectedRoute
      user={user}
      allowedRoles={["admin", "agent"]}
    >
      <Claims />
    </ProtectedRoute>
  }
/>
           <Route
  path="/documents"
  element={
    <ProtectedRoute
      user={user}
      allowedRoles={["admin", "agent"]}
    >
      <Documents />
    </ProtectedRoute>
  }
/>
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
  path="/reports"
  element={
    <ProtectedRoute user={user} allowedRoles={["admin"]}>
      <Reports />
    </ProtectedRoute>
  }
/>

       </Routes>
</BrowserRouter>

);
}

export default App;