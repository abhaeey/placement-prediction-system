import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    note: ""
  });

  const handleNext = (e) => {
    e.preventDefault();
    localStorage.setItem("student_intro", JSON.stringify(user));
    navigate("/predict");
  };

  const handleClose = () => {
    window.location.href = "/";
  };

  return (
    <div className="page home-page">
      <button className="close-btn" onClick={handleClose}>×</button>

      <div className="home-card">
        <h1>Placement Probability Prediction System</h1>

        <p className="welcome">
          Welcome to the AI-driven placement readiness assistant.
        </p>

        <p className="warning">
          This model predicts placement probability; it does not confirm actual placement.
        </p>

        <form onSubmit={handleNext} className="home-form">
          <input
            type="text"
            placeholder="Enter your name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Optional note / class / batch"
            value={user.note}
            onChange={(e) => setUser({ ...user, note: e.target.value })}
          />

          <button type="submit">Next</button>
        </form>
      </div>
    </div>
  );
}

export default Home;