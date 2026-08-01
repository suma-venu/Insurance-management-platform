
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
 const [currentPage, setCurrentPage] = useState(1);

const customersPerPage = 5;

 async function handleAddCustomer(event) {
  event.preventDefault();

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const trimmedAddress = address.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (
    !trimmedName ||
    !dob ||
    !trimmedPhone ||
    !trimmedAddress ||
    !trimmedEmail
  ) {
    setMessage("Please fill in all fields.");
    return;
  }

  if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
    setMessage("Name should contain only letters and spaces.");
    return;
  }

  if (!/^\d{10}$/.test(trimmedPhone)) {
    setMessage("Phone number must contain exactly 10 digits.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    setMessage("Please enter a valid email address.");
    return;
  }

  setMessage(editingId ? "Updating customer..." : "Adding customer...");

  let duplicateQuery = supabase
    .from("customers")
    .select("id")
    .eq("email", trimmedEmail);

  if (editingId) {
    duplicateQuery = duplicateQuery.neq("id", editingId);
  }

  const { data: existingCustomers, error: duplicateError } =
    await duplicateQuery.limit(1);

  if (duplicateError) {
    setMessage("Unable to validate the email. Please try again.");
    return;
  }

  if (existingCustomers && existingCustomers.length > 0) {
    setMessage("A customer with this email already exists.");
    return;
  }

  let error;

  const customerData = {
    name: trimmedName,
    dob: dob,
    phone: trimmedPhone,
    address: trimmedAddress,
    email: trimmedEmail,
  };

  if (editingId) {
    const response = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", editingId);

    error = response.error;
  } else {
    const response = await supabase
      .from("customers")
      .insert([customerData]);

    error = response.error;
  }

  if (error) {
    console.error("Customer save error:", error);

    if (error.code === "23505") {
      setMessage("This customer email already exists.");
    } else {
      setMessage("Unable to save the customer. Please try again.");
    }

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

  await fetchCustomers();
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


const filteredCustomers = customers.filter((customer) =>
  customer.name.toLowerCase().includes(search.toLowerCase())
);

const lastCustomer = currentPage * customersPerPage;
const firstCustomer = lastCustomer - customersPerPage;

const currentCustomers = filteredCustomers.slice(
  firstCustomer,
  lastCustomer
);

const totalPages = Math.ceil(
  filteredCustomers.length / customersPerPage
);

async function handleDeleteCustomer(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this customer?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    setMessage("Unable to delete customer.");
    return;
  }

  setMessage("Customer deleted successfully.");

  if (editingId === id) {
    setEditingId(null);
    setName("");
    setDob("");
    setPhone("");
    setAddress("");
    setEmail("");
  }

  await fetchCustomers();
}

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
  type="tel"
  placeholder="Phone"
  value={phone}
  onChange={(event) => setPhone(event.target.value)}
  maxLength={10}
  inputMode="numeric"
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

   {message && (
  <div
    className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
      message.toLowerCase().includes("success") ||
      message.toLowerCase().includes("registered") ||
      message.toLowerCase().includes("updated") ||
      message.toLowerCase().includes("deleted")
        ? "border-green-200 bg-green-50 text-green-700"
        : message.toLowerCase().includes("adding") ||
          message.toLowerCase().includes("updating")
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    {message}
  </div>
)}
      </div>
  <div className="rounded-xl bg-white p-6 shadow">

     {/* Search Box */}

  
<input
  type="text"
  placeholder="Search customer..."
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }}
  className="mb-4 w-full rounded-lg border p-3"
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
  {currentCustomers.length === 0 ? (
    <tr>
      <td
        colSpan="6"
        className="py-8 text-center text-slate-500"
      >
        No customers found.
      </td>
    </tr>
  ) : (
    currentCustomers.map((customer) => (
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
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => handleEditCustomer(customer)}
      className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
    >
      Edit
    </button>

    <button
      type="button"
      onClick={() => handleDeleteCustomer(customer.id)}
      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
    >
      Delete
    </button>
  </div>
</td>


                </tr>
             ))
)}
</tbody>

          </table>
</div>

<div className="mt-6 flex justify-center gap-2">
  <button
    onClick={() =>
      setCurrentPage((page) => Math.max(page - 1, 1))
    }
    disabled={currentPage === 1}
    className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-300"
  >
    Previous
  </button>

  <span className="px-4 py-2">
    {currentPage} / {totalPages || 1}
  </span>

  <button
    onClick={() =>
      setCurrentPage((page) =>
        Math.min(page + 1, totalPages)
      )
    }
    disabled={currentPage === totalPages || totalPages === 0}
    className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-300"
  >
    Next
  </button>
</div>

</div>

    </div>
  </div>
  
);
}

export default Customers;