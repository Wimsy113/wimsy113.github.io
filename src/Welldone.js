import banner from "./images/welldone-banner.png";
import welldoneIcon1 from "./images/welldone-icon1.png";
import welldoneIcon2 from "./images/welldone-icon2.png";
import welldoneIcon3 from "./images/welldone-icon3.png";
import welldoneUserFlow1 from "./images/welldone-user-flows1.png";
import welldoneUserFlow2 from "./images/welldone-user-flows2.png";
import welldoneWireframe1 from "./images/welldone-wireframe1.png";
import welldoneWireframe2 from "./images/welldone-wireframe2.png";
import hiFiMobile1 from "./images/welldone-hi-fi-mobile1.png";
import hiFiMobile2 from "./images/welldone-hi-fi-mobile2.png";
import hiFiDesktop1 from "./images/welldone-hi-fi-desktop1.png";
import hiFiDesktop2 from "./images/welldone-hi-fi-desktop2.png";
import hiFiDesktop3 from "./images/welldone-hi-fi-desktop3.png";
import hiFiDesktop4 from "./images/welldone-hi-fi-desktop4.png";
import hiFiDesktop5 from "./images/welldone-hi-fi-desktop5.png";
import "./styles/Welldone.css";

function Welldone() {
    return(
        <div className="welldone-container">
            <img className="banner" src={banner} alt="Welldone Banner"/>
            <div className="section">
                <h2>
                    Project Overview:
                </h2>
                <p>
                    WellDone is an app suite designed to help users track and maintain sensors for water wells 
                    in underdeveloped countries. By providing data and maintenance alerts, it ensures the 
                    sustainable operation of vital water resources in these regions.
                </p>
            </div>

            <div className="section">
                <h2>
                    User Problems:
                </h2>
                <p className="blue">
                    Difficulty in continuously monitoring the functionality of water well sensors due to unreliable 
                    internet connectivity.
                    <br/><br/>
                    Challenges in receiving timely maintenance alerts on mobile devices in regions with limited network 
                    coverage.
                    <br/><br/>
                    Inability to ensure sustainable operation of water wells without real-time data on sensor status.
                    <br/><br/>
                    Lack of an efficient and lightweight solution for well managers and workers to manage water resources 
                    effectively in underdeveloped areas.
                </p>
            </div>

            <div className="section">
                <h2 className="h2-center">
                    Project Goals
                </h2>
                <div>
                    <div className="section-item">
                        <img src={welldoneIcon1} alt="icon1"/>
                        <p>
                            Enhance Resilience Point's interface for user-friendly community preparedness tracking.
                        </p>
                    </div>
                    <div className="section-item">
                        <img src={welldoneIcon2} alt="icon2"/>
                        <p>
                            Integrate robust data capabilities for streamlined hazard recovery assessment.
                        </p>
                    </div>
                    <div className="section-item">
                        <img src={welldoneIcon3} alt="icon3"/>
                        <p>
                            Optimize collaboration between Resilience Point and Hazadapt for effective resilience initiatives.
                        </p>
                    </div>
                </div>
            </div>

            <div className="section">
                <h2>
                    Research:
                </h2>
                <p>
                    To better understand the needs of well managers and well maintainers, primary research was conducted through 
                    extensive interviews with key stakeholders and workers in the field. This involved detailed discussions to 
                    gather insights on their daily challenges, particularly focusing on issues related to sensor monitoring and 
                    maintenance in regions with poor internet connectivity. By engaging directly with the end-users, the user 
                    experience designers were able to identify critical requirements and pain points, which informed the creation 
                    of preliminary wireframes. These wireframes were designed to address the specific needs highlighted during the 
                    interviews, ensuring the WellDone app would be both practical and effective for its intended users.
                </p>
            </div>

            <div className="section">
                <h2>
                    User Flows:
                </h2>
                <p>
                    Using the research gathered from interviews with stakeholders and workers, we created detailed user flows to map 
                    out the entire user experience of the WellDone app. These user flows illustrated the steps well managers and maintainers 
                    would take to monitor sensor functionality and receive maintenance alerts. By incorporating the insights from our 
                    primary research, we ensured that the user flows addressed the specific needs and pain points identified, leading to a 
                    more intuitive and efficient app design.
                </p>
                <img className="flow" src={welldoneUserFlow1} alt="Welldone User Flow"/>
                <img className="flow" src={welldoneUserFlow2} alt="Welldone User Flow"/>
            </div>

            <div className="section">
                <h2>
                    Wireframes:
                </h2>
                <p>
                    Using the research gathered from interviews with stakeholders and workers, we created detailed low-fi wireframes to 
                    visually represent the WellDone app's interface. These wireframes illustrated how well managers and maintainers would 
                    navigate the app to monitor sensor functionality and receive maintenance alerts. By incorporating the insights from our 
                    primary research, we ensured that the wireframes addressed the specific needs and pain points identified, leading to a 
                    more intuitive and user-friendly app design.
                </p>
                <img className="flow" src={welldoneWireframe1} alt="Welldone User Flow"/>
                <img className="flow" src={welldoneWireframe2} alt="Welldone User Flow"/>
            </div>

            <div className="section">
                <h2>
                    What We Learned:
                </h2>
                <p>
                    Through testing the initial low-fi wireframes with maintainers and well managers, we discovered that alerts were being 
                    received as snapshots rather than in real-time. To address this, our designs incorporated timestamps to accurately 
                    reflect when alerts were generated. Additionally, feedback highlighted challenges with managing a high volume of wells, 
                    prompting layout adjustments. It was concluded that a table view format would better organize and display information 
                    compared to the initially proposed card view, ensuring efficient monitoring and maintenance of multiple wells within the 
                    WellDone app.
                </p>
            </div>

            <div className="section">
                <h2>
                    Where We Landed:
                </h2>
                <p className="blue">
                    Through testing the initial low-fi wireframes with maintainers and well managers, we discovered that alerts were being 
                    received as snapshots rather than in real-time. To address this, our designs incorporated timestamps to accurately 
                    reflect when alerts were generated. Additionally, feedback highlighted challenges with managing a high volume of wells, 
                    prompting layout adjustments. It was concluded that a table view format would better organize and display information compared 
                    to the initially proposed card view, ensuring efficient monitoring and maintenance of multiple wells within the WellDone app.
                </p>
            </div>

            <div className="section">
                <h2>
                    Final Result:
                </h2>
                <p>
                    The final version of the WellDone app integrates user feedback to optimize functionality for well managers and maintainers 
                    in underdeveloped regions. It features a table view interface for efficient management of multiple wells, enhanced with 
                    timestamps for accurate alert tracking. Users can now easily locate and contact maintainers via WhatsApp or phone numbers 
                    directly from the app to swiftly address maintenance needs. These updates ensure reliable monitoring and timely response, 
                    supporting sustainable water resource management in challenging environments.
                </p>
            </div>

            <div className="section">
                <h2>
                    Impact:
                </h2>
                <p>
                    Welldone has significantly improved communication and coordination between well workers and well managers, creating 
                    a more efficient and transparent workflow. By streamlining information sharing, the platform ensures that critical updates 
                    on well statuses are delivered in real-time, allowing for quicker responses to maintenance needs and operational challenges. 
                    This enhanced level of communication not only supports better oversight and resource allocation but also strengthens the 
                    ability of countries to consistently monitor and manage their water infrastructure. As a result, disruptions are minimized, 
                    and communities can rely on a steady and uninterrupted supply of clean water, even in the face of logistical or environmental 
                    challenges. Welldone isn’t just optimizing processes—it’s playing a key role in safeguarding access to one of our most 
                    essential resources.
                </p>
            </div>

            <div className="section">
                <h2 className="h2-center">
                    Hi-Fi Mobile Screens
                </h2>
                <div className="hi-fi-mobile">
                    <img src={hiFiMobile1} alt=""/>
                    <img src={hiFiMobile2} alt=""/>
                </div>
            </div>

            <div className="section">
                <h2>
                    Hi-Fi Desktop Screens
                </h2>
                <img className="flow" src={hiFiDesktop1} alt=""/>
                <img className="flow" src={hiFiDesktop2} alt=""/>
                <img className="flow" src={hiFiDesktop3} alt=""/>
                <img className="flow" src={hiFiDesktop4} alt=""/>
                <img className="flow" src={hiFiDesktop5} alt=""/>
            </div>
        </div>

    )
}

export default Welldone;