import { BrowserRouter as Router, Link } from "react-router-dom";
import bigFace from "./images/big-face.png";
import pin from "./images/pin.png";
import hazadaptLogo from "./images/hazadapt-logo.png";
import hazadaptImage from "./images/hazadapt-image.png";
import welldoneLogo from "./images/welldone-logo.png";
import welldoneImage from "./images/welldone-image.png";
import operationCodeLogo from "./images/operationCode-logo.png";
import operationCodeImage from "./images/operation-code-image.png";
import trueLinkLogo from "./images/true-link-logo.png";
import trueLinkImage from "./images/true-link-image.png";
import bioPhoto from "./images/bioPhoto.png";
import linkedIn from "./images/linkedIn.png";
import instagram from "./images/instagram.png";
import gmail from "./images/gmail.png";

function Home() {
    return (
        <div className="home-container">
          <div className="big-face-container">
            <div className="big-face-text">
              <h2><span className="big-face-text-purple">Krystyna</span> is a UX Designer, Creative, 
              Content Creator and 3-D Print Professional  located in <span className="big-face-text-green">Columbus, 
              Ohio</span><img className="pin" src={pin} alt="Ohio pin marker"/></h2>
            </div>
            <img className="big-face" src={bigFace} alt="Background for Home page" />
          </div>
          <div id="work"></div>
          {/* Hazadapt */}
          <Link to={"/Hazadapt"} className="home-element , desktop">
              <div className="home-element-left">
                <img className="hazadapt-logo" src={hazadaptLogo} alt="HazAdapt Logo"/>
                <p className="text1">Timeline: August 2022-Present</p>
                <p className="text2">A collection of hazard guides and preparation activities designed to help people increase their resilience and recovery in a crisis</p>
              </div>
              <div className="home-element-right"><img src={hazadaptImage} alt="HazAdapt on a phone"/></div>
          </Link>
          <div className="home-element , mobile">
            <div className="home-element-left">
              <img className="hazadapt-logo" src={hazadaptLogo} alt="HazAdapt Logo"/>
              <p className="text1">Timeline: August 2022-Present</p>
              <p className="text2">A collection of hazard guides and preparation activities designed to help people increase their resilience and recovery in a crisis</p>
            </div>
            <div className="home-element-right"><Link className="element-button" to={"/Hazadapt"}>View Case Study</Link><img src={hazadaptImage} alt="HazAdapt on a phone"/></div>
          </div>
          {/* Well Done */}
          <Link className="home-element , well-done , desktop">
              <div className="home-element-left">
                <img className="hazadapt-logo" src={welldoneLogo} alt="Well Done Logo"/>
                <p className="text1">Timeline: August 2022-Present</p>
                <p className="text2">A humanitarian aide project that provides real time status tracking of water well function in underdeveloped countries</p>
              </div>
              <div className="home-element-right"><img src={welldoneImage} alt="Well Done on a computer"/></div>
          </Link>
          <div className="home-element , well-done , mobile">
            <div className="home-element-left">
              <img className="hazadapt-logo" src={welldoneLogo} alt="Well Done Logo"/>
              <p className="text1">Timeline: August 2022-Present</p>
              <p className="text2">A humanitarian aide project that provides real time status tracking of water well function in underdeveloped countries</p>
            </div>
            <div className="home-element-right"><Link className="element-button" to=" ">View Case Study</Link><img src={welldoneImage} alt="Well Done on a computer"/></div>
          </div>
          {/* Operation Code */}
          <Link className="home-element , operation-code , desktop">
              <div className="home-element-left">
                <img className="hazadapt-logo" src={operationCodeLogo} alt="Operation Code Logo"/>
                <p className="text1">Timeline: August 2022-Present</p>
                <p className="text2">Connecting veterans to education and opportunities in tech leveraging community resources and veteran education benefits</p>
              </div>
              <div className="home-element-right"><img src={operationCodeImage} alt="Operation Code on a computer"/></div>
          </Link>
          <div className="home-element , operation-code , mobile">
            <div className="home-element-left">
              <img className="hazadapt-logo" src={operationCodeLogo} alt="Operation Code Logo"/>
              <p className="text1">Timeline: August 2022-Present</p>
              <p className="text2">Connecting veterans to education and opportunities in tech leveraging community resources and veteran education benefits</p>
            </div>
            <div className="home-element-right"><Link className="element-button" to=" ">View Case Study</Link><img src={operationCodeImage} alt="Operation Code on a computer"/></div>
          </div>
          {/* True Link */}
          <Link className="home-element , true-link , desktop">
            <div className="home-element-left">
              <img className="hazadapt-logo" src={trueLinkLogo} alt="HazAdapt Logo"/>
              <p className="text1">Timeline: August 2022-Present</p>
              <p className="text2">A financial institution working to ensure the safety and freedom of aging and disabled populations</p>
            </div>
            <div className="home-element-right"><img src={trueLinkImage} alt="True Link shown on a computer"/></div>
          </Link>
          <div className="home-element , true-link , mobile">
            <div className="home-element-left">
              <img className="hazadapt-logo" src={trueLinkLogo} alt="HazAdapt Logo"/>
              <p className="text1">Timeline: August 2022-Present</p>
              <p className="text2">A financial institution working to ensure the safety and freedom of aging and disabled populations</p>
            </div>
            <div className="home-element-right"><Link className="element-button" to=" ">View Case Study</Link><img src={trueLinkImage} alt="True Link shown on a computer"/></div>
          </div>
          {/* About Section */}
          <div className="home-element , krys-bio">
            <div className="home-element-left">
              <p className="text1">Krystyna is an experienced user experience professional, who places the user first. </p>
              <p className="text2">Having coded and designed for organizations ranging from non-profits
              to Series-B venture backed startups; working well as either an independent contractor 
              or integrated directly into teams.<br/><br/>
              They are currently with an early stage startup Hazadapt on a myriad of projects including 
              the hazard dashboard ResiliencePoint. Which is currently in use by several emergency 
              management entities across the United States. <br/><br/>
              In their free time, they engage in the hobbies illustration, 3-D printing and prototyping.</p>
              <div className="bio-contact">
                <p>Contact:</p>
                <Link><img src={linkedIn} alt="LinkedIn"/></Link>
                <Link><img src={instagram} alt="LinkedIn"/></Link>
                <Link><img src={gmail} alt="LinkedIn"/></Link>
              </div>
            </div>
            <div className="home-element-right"><img src={bioPhoto} alt="bio"/></div>
          </div>
        </div>
    );
  }

export default Home;