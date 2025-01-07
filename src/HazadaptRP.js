import './styles/Hazadapt.css';
import banner from "./images/hazadapt-rp-banner.png";
import hazadaptIcon1 from "./images/hazadapt-icon-1.png";
import hazadaptIcon2 from "./images/hazadapt-icon-2.png";
import hazadaptIcon3 from "./images/hazadapt-icon-3.png";
import firstIteration from "./images/first-iteration.png";
import backtothe from "./images/back-to-the.png";
import hifi from "./images/hi-fi.png"

function HazAdapt() {
    return (
        <div className="hazadapt-rp-container">
            <img className="banner" src={banner} alt="Hazadapt Banner"/>
            <div className="section">
                <h2>
                    Project Overview:
                </h2>
                <p>
                    Resilience Point is a specialized dashboard developed to empower emergency 
                    managers in monitoring community preparedness and facilitating initiatives 
                    aimed at enhancing community resilience. Created with the goal of seamlessly 
                    tracking and improving readiness levels, it supports strategic efforts to bolster 
                    community resilience in the face of potential hazards and emergencies.
                </p>
            </div>
            <div className="section">
                <h2>
                    User Problems:
                </h2>
                <p className="blue">
                    Difficulty in efficiently tracking and monitoring community preparedness levels.
                    <br/><br/>
                    Lack of centralized tools for assessing and improving community resilience.
                    <br/><br/>
                    Challenges in integrating and analyzing diverse data sources critical for hazard recovery planning.
                    <br/><br/>
                    Limited coordination hinders effective community readiness and resilience initiatives.
                </p>
            </div>
            <div className="section">
                <h2 className="h2-center">
                    Project Goals
                </h2>
                <div>
                    <div className="section-item">
                        <img src={hazadaptIcon1} alt="icon1"/>
                        <p>
                            Enhance Resilience Point's interface for user-friendly community preparedness tracking.
                        </p>
                    </div>
                    <div className="section-item">
                        <img src={hazadaptIcon2} alt="icon2"/>
                        <p>
                            Integrate robust data capabilities for streamlined hazard recovery assessment.
                        </p>
                    </div>
                    <div className="section-item">
                        <img src={hazadaptIcon3} alt="icon3"/>
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
                    The UX team conducted research by engaging directly with emergency managers to identify their 
                    operational needs, highlighting deficiencies in current methods that often appear outdated and 
                    fragmented. Resilience Point offers a modern approach by integrating user feedback to create a 
                    streamlined dashboard, enhancing accessibility and data integration to effectively track community 
                    preparedness and resilience levels in real-time. This proactive approach aims to address the shortcomings 
                    of traditional methods, empowering emergency managers with actionable insights for more efficient response 
                    and recovery efforts.
                </p>
            </div>
            <div className="section">
                <h2>
                    First Iteration: 
                </h2>
                <p>
                    In its first iteration, ResiliencePoint integrates insights gleaned from extensive research with emergency 
                    managers and draws inspiration from various data and emergency management entities. The dashboard design 
                    prioritizes a conversational interface, moving away from overwhelming data-centric displays to provide intuitive, 
                    actionable insights. This approach aims to transform the user experience by making complex information more 
                    accessible, enabling emergency managers to make informed decisions swiftly and effectively during critical situations.
                </p>
                <img className="first-iteration" src={firstIteration} alt="first iteration"/>
            </div>
            <div className="section">
                <h2>
                    What We Learned:
                </h2>
                <p>
                    In our search for a way to create a platform that sets itself apart from other emergency management systems, some 
                    interesting findings emerged. These insights shaped our approach and highlighted key areas of focus:
                    <br/><br/>
                    <ul>
                        <li>
                            <strong>Clarity in Information Presentation:</strong> Users require clear, concise, and easily digestible information, 
                            especially in high-pressure situations where quick decisions are critical.
                        </li>
                        <li>
                            <strong>Scannability and Data Separation:</strong> The ability to quickly scan, separate, and reference specific data 
                            points proved essential. Users need an interface that minimizes cognitive load and allows them to locate 
                            key information effortlessly.
                        </li>
                        <li>
                            <strong>Searchability:</strong> Information must be highly searchable, enabling users to find precise data points or historical 
                            records without unnecessary friction.
                        </li>
                        <li>
                            <strong>Humanization of Data Presentation:</strong> Presenting data in a way that feels more like a conversation rather than 
                            rigid numbers fosters better engagement and understanding. Users respond well to interfaces that incorporate 
                            context, storytelling, and a more approachable tone.
                        </li>
                    </ul>
                    These findings underscored the importance of user-centered design principles in building a platform tailored to the 
                    unique challenges of emergency management.
                </p>
            </div>
            <div className="section">
                <h2>
                    Back to the Drawing Board: 
                </h2>
                <p>
                    Following an initial round of feedback and research, ResiliencePoint underwent reassessment which revealed that replacing 
                    the top menu with a collapsible side menu significantly enhanced usability. This change allowed for more information to be 
                    displayed on the page, improving scannability and readability, while also preserving essential conversational elements. Additionally, 
                    UI tweaks and the introduction of overview cards displaying statistical information were based on user preferences and usability testing, 
                    demonstrating a marked improvement in navigating the dashboard and accessing critical data for emergency management purposes.
                </p>
                <img className="back-to-the" src={backtothe} alt="Back to the Drawing Board"/>
            </div>
            <div className="section">
                <h2>
                    Why Start Over?
                </h2>
                <p>
                    We decided to start over with ResiliencePoint because the initial design did not resonate well with users, failing to align 
                    with their expectations and usability standards. It's crucial to take things back to the drawing board when designs don't stick 
                    because it allows us to reevaluate user needs, incorporate new insights from feedback and research, and ultimately refine the 
                    product to better meet user expectations. This process ensures that we deliver a solution that is not only functional but also 
                    intuitive and user-friendly, enhancing overall user satisfaction and effectiveness in emergency management scenarios.
                </p>
            </div>
            <div className="section">
                <h2>
                    Where We Landed:
                </h2>
                <p className="blue">
                    The dashboard developed for emergency managers to monitor community resilience initially focused on a conversational interface 
                    but encountered usability challenges due to divergent user expectations and technical constraints. Following extensive user 
                    feedback and research, revisions were made, such as implementing a collapsible side menu, refining UI elements, and introducing 
                    overview cards displaying statistical data. These adjustments significantly enhanced usability by improving information 
                    accessibility and readability, demonstrating the iterative process of aligning design with user needs for more effective emergency 
                    management tools.
                </p>
            </div>
            <div className="section">
                <h2>
                    Final Result:
                </h2>
                <p>
                    The final iteration of ResiliencePoint, the dashboard for emergency managers, embodies a responsive approach to user feedback 
                    and research insights. By pivoting from a conversational interface to a more intuitive design with a collapsible side menu 
                    and streamlined UI elements, alongside the addition of overview cards for statistical data, Resilience Point now offers 
                    enhanced usability and functionality. These refinements underscore the importance of iterative design in meeting user needs 
                    and improving tools for effective community resilience and emergency management.
                </p>
            </div>
            <div className="section">
                <h2>
                    Hi-Fi Desktop Screens:
                </h2>
                <img className="hi-fi" src={hifi} Alt="Hi-Fi Desktop Screens"/>
            </div>
        </div>
    )

}

export default HazAdapt;