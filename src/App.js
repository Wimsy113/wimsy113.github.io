import React, { useState, useEffect } from "react";
import { BrowserRouter as BrowserRouter, Routes, Route, Link } from "react-router-dom";
import './styles/App.css';
import logo from "./images/logo.png";
import Home from "./Home";
import Work from "./Work";
import About from "./About";
import Hazadapt from "./Hazadapt";
import Art from "./Art";
import linkedIn from "./images/linkedIn.png";
import gmail from "./images/gmail.png";
import github from "./images/github-logo.png";

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
  <BrowserRouter basename="/wimsy113">
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
          <Route path="/Hazadapt" element={<Hazadapt/>}/>
        </Routes>
      </div>
      <footer>
        <div className="bio-contact">
          <p>Website built with care, by Matthew Lee: </p>
          <Link to=""><img src={linkedIn} alt="LinkedIn"/></Link>
          <Link to=""><img src={github} alt="Github"/></Link>
          <Link to=""><img src={gmail} alt="Gmail"/></Link>
        </div>
      </footer>
    </div>
  </BrowserRouter>
  );
}

export default App;
