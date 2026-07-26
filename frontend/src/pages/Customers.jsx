
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function Customers(){

  const[name, setName]= useState("");
  const[dob, setDob]= useState("");
  const[phone, setPhone]= useState("");
  const[address, setAddress]= useState("");
  const[email, setEmail]= useState("");
  const[message, setMessage]= useState("");
  const[customers,setCustomers]= useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function handleAddCustomer(event){
event.preventDefault();

if(!name || !dob|| !phone || !address || !email ){
  setMessage("Please fill in all fields.");
  return;
}
setMessage("adding customer...");


let error;

if (editingId) {
  const response = await supabase
    .from("customers")
    .update({
      name: name,
      dob: dob,
      phone: phone,
      address: address,
      email: email,
    })
    .eq("id", editingId);

  error = response.error;
} else {
  const response = await supabase
    .from("customers")
    .insert([
      {
        name: name,
        dob: dob,
        phone: phone,
        address: address,
        email: email,
      },
    ]);

  error = response.error;
}


     if (error) {
    setMessage(error.message);
    return;
  }

  setMessage(
  editingId
    ? "Customer updated successfully."
    : "Customer registered successfully."
);

  setName("");
  setDob("");
  setPhone("");
  setAddress("");
  setEmail("");
  setEditingId(null);
fetchCustomers();
 }

 async function fetchCustomers(){
  const {data, error}= await supabase
  .from("customers")
  .select("*");

  if(error){
    console.log(error.message);
    return;
  }
setCustomers(data);
 }

 function handleEditCustomer(customer) {
  setEditingId(customer.id);
  setName(customer.name);
  setDob(customer.dob);
  setPhone(customer.phone);
  setAddress(customer.address);
  setEmail(customer.email);
  setMessage("Editing customer details.");
}


 useEffect(() => {
  fetchCustomers();
}, []);

return (
  <div className="min-h-screen bg-sky-300 p-6">
    <div className="mx-auto max-w-6xl">
    <h1 className="mb-6 text-3xl font-bold text-slate-500">Customer Management</h1>

    <Link
  to="/customer-dashboard"
  className="mb-4 inline-block rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
>
  Back to Dashboard
</Link>

    <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-slate-700">
          Register Customer
        </h2>

    <form onSubmit={handleAddCustomer}
      className="grid grid-cols-1 gap-4 md:grid-cols-2" >

      <input
        type="text"
        placeholder="Customer Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
         className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-green-500"
        required
      />

      <input
        type="date"
        value={dob}
        onChange={(event) => setDob(event.target.value)}
         className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-green-500"
         required
      />

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
         className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-green-500"
         required
      />

      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
         className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-green-500 md:col-span-2"
         required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
         className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-green-500"
         required
      />

      <button type="submit"
         className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 md:col-span-2">
       {editingId ? "Update Customer" : "Add Customer"}
      </button>

    </form>

    <p className="mt-4 text-sm font-medium text-slate-700">
      {message}
      </p>
      </div>
  <div className="rounded-xl bg-white p-6 shadow">

     {/* Search Box */}

  <input
    type="text"
    placeholder="Search Customer..."
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
  />

    <h2 className="mb-4 text-xl font-semibold text-slate-700">Customer list</h2>

    <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b bg-slate-50">
                
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Actions</th>
                </tr>
                </thead>
               
 
  
           

<tbody>
              {customers.filter((customer) =>
              customer.name.toLowerCase ().includes(search.toLowerCase())
    )
                 .map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="px-4 py-3">{customer.dob}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.address}</td>
                  <td className="px-4 py-3">{customer.email}</td>
             <td className="px-4 py-3">
            <button
              type="button"
              onClick={() => handleEditCustomer(customer)}
              className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
            >
              Edit
            </button>
          </td>


                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
);
}

export default Customers;