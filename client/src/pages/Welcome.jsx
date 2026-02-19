import { useNavigate } from "react-router-dom";
import "./welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-wrap">
      <div className="welcome-left">
        <h1 className="welcome-title">
          <span className="accent">Connect</span> with your loved Ones
        </h1>

        <p className="welcome-sub">Cover a distance by Video Call</p>

        <button className="welcome-btn" onClick={() => navigate("/app")}>
          Get Started
        </button>
      </div>

      <div className="welcome-right">
        {/* image cards */}
        <img
          src="/tiles/zoom-loved-one.jfif"
          className="phone phone-a"
          alt="Video call"
        />
        <img
          src="/tiles/zoom-loved-one.jfif"
          className="phone phone-b"
          alt="Video call"
        />
      </div>
    </div>
  );
}
