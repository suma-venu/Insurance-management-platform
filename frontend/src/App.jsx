import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from"./pages/Home";
import Login from "./pages/Login";
import Register from"./pages/Register";
import Customers from"./pages/Customers";
import Policies from"./pages/Policies";
import Dashboard from "./pages/Dashboard";
import Premiums from"./pages/Premiums";
import Claims from"./pages/Claims";






function App(){

return (
<BrowserRouter>
 <Navbar />
       <Routes>
         <Route path="/" element={<Home />} />
           <Route path="/login" element={<Login/>}/>
           <Route path="/register" element={<Register/>}/>
           <Route path="/customers" element={<Customers/>}/>
            <Route path="/policies" element={<Policies/>}/>
            <Route path="/customer-dashboard"element={<Dashboard />}/> 
            <Route path="/premiums" element={<Premiums/>}/>
            <Route path="/claims" element={<Claims/>}/>
       </Routes>
</BrowserRouter>

);
}

export default App;