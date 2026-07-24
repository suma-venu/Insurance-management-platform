import {supabase} from "../lib/supabase";

import { useState } from "react";

function Register(){
  const [name, setName] = useState("");
   const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
     const [role, setRole] = useState("customer");
      const [message, setMessage] = useState("");



async function handleRegister(event) {
  event.preventDefault();

  if (!name || !email || !password || !role) {
  setMessage("Please fill in all fields.");
  return;
}

  setMessage("Creating account...");

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name,
        role: role,
      },
    },
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  if (data.user) {
  if (data.session) {
    setMessage("Registration successful. You are now logged in.");
  } else {
    setMessage(
      "Registration successful. Please check your email to confirm your account."
    );
  }

    setName("");
    setEmail("");
    setPassword("");
    setRole("customer");
  }
}
return(
<div>
  <h1>Register</h1>

  <form onSubmit={handleRegister}>
    
    <input type="text" placeholder="Name" value={name} onChange={(event)=> setName(event.target.value)} required/>

    <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  required
/>
      <input type="password" placeholder="Password" value={password} onChange={(event)=> setPassword(event.target.value)} required/>

      <select value={role} onChange={(event)=> setRole(event.target.value)} required>

<option value="customer">Customer</option>
<option value="agent">Agent</option>
<option value="admin">Admin</option>

      </select>
      <button type="submit">Register</button>
</form>

<p>{message}</p>
</div>

);
}

export default Register;