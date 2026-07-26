import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from"./pages/Home";
import Login from "./pages/Login";
import Register from"./pages/Register";
import Customers from"./pages/Customers";
import Policies from"./pages/Policies";
import Dashboard from "./pages/Dashboard";





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
       </Routes>
</BrowserRouter>

);
}

export default App;