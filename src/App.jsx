import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import style from './App.css';
import Cadastro from "./pages/cadastro.jsx";
import Login from "./pages/login.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Cadastro />} />
                <Route path="/login" element={<Login />} />
                
            </Routes>
        </Router>
    );
}

export default App;