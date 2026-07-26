import {BrowserRouter, Routes, Route} from "react-router-dom";

import Login from "./pages/Login";
import Register from"./pages/Register";
import Customers from"./pages/Customers";

function App(){

return (
<BrowserRouter>
       <Routes>
           <Route path="/login" element={<Login/>}/>
           <Route path="/register" element={<Register/>}/>
           <Route path="/customers" element={<Customers/>}/>
       </Routes>
</BrowserRouter>

);
}

export default App;