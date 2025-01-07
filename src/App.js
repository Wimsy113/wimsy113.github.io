import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import ScrollToTop from "./function/ScrollToTop";
import './styles/App.css';
import logo from "./images/logo.png";
import Home from "./Home";
import Work from "./Work";
import About from "./About";
import HazadaptRP from "./HazadaptRP";
import Art from "./Art";
import Welldone from "./Welldone";

function App() {

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
  
    window.addEventListener("scroll", handleScroll);
  
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
  <Router>
  <ScrollToTop />
    <div className="app-body">
      <nav className={`nav ${isSticky ? "sticky" : ""}`}>
        <ul className="nav-list">
          <div className="home-button">
            <Link to="/">
              <img src={logo} alt="Logo for Home button"/>
            </Link>
          </div>
          <li className="nav-item"><Link to="/About">About</Link></li>
          <li className="nav-item"><Link to="/Work">Work</Link></li>
          <li className="nav-item"><Link to="/Art">Art</Link></li>
          
        </ul>
      </nav>
      <div className="content">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/Work" element={<Work/>}/>
          <Route path="/About" element={<About/>}/>
          <Route path="/Art" element={<Art/>}/>
          <Route path="/HazadaptRP" element={<HazadaptRP/>}/>
          <Route path="/Welldone" element={<Welldone/>}/>
        </Routes>
      </div>
    </div>
  </Router>
  );
}

export default App;
