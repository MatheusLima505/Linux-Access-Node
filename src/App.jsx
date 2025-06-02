import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Cadastro from "./pages/cadastro.jsx";
import Login from "./pages/login.jsx";
import Home from "./pages/home.jsx"

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Cadastro />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home /> }/>
                
            </Routes>
        </Router>
    );
}

export default App;