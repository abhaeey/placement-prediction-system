import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const savedResult = localStorage.getItem("prediction_result");
    const savedStudent = localStorage.getItem("student_intro");

    if (savedResult) setResult(JSON.parse(savedResult));
    if (savedStudent) setStudent(JSON.parse(savedStudent));
  }, []);

  const handleClose = () => {
    navigate("/");
  };

  const handleSaveExit = () => {
    localStorage.removeItem("prediction_result");
    navigate("/");
  };

  const getColorClass = (category) => {
    if (category === "High Chance") return "result-high";
    if (category === "Moderate Chance") return "result-moderate";
    return "result-low";
  };

  if (!result) {
    return (
      <div className="page">
        <button className="close-btn" onClick={handleClose}>×</button>
        <div className="home-card">
          <h1>No Result Found</h1>
          <p>Please complete the prediction form first.</p>
          <button onClick={() => navigate("/predict")}>Go to Prediction</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page result-page">
      <button className="close-btn" onClick={handleClose}>×</button>

      <div className="result-card-final">
        <h1>Prediction Result</h1>

        {student?.name && (
          <p className="sub-text">Result for <b>{student.name}</b></p>
        )}

        <div className={`animated-circle ${getColorClass(result.category)}`}>
          <span>{result.placement_probability}%</span>
        </div>

        <h2 className="prediction-text">{result.prediction}</h2>
        <p className={`chance-badge ${getColorClass(result.category)}`}>
          {result.category}
        </p>

        <div className="metrics-box">
          <div>
            <h4>CGPA %</h4>
            <p>{result.cgpa_percentage}</p>
          </div>

          <div>
            <h4>Consistency</h4>
            <p>{result.academic_consistency}</p>
          </div>

          <div>
            <h4>Trend</h4>
            <p>{result.academic_trend}</p>
          </div>
        </div>

       <div className="analysis-section">
  <div className="strength-box">
    <h3>Strengths</h3>
    {result.strengths && result.strengths.length > 0 ? (
      result.strengths.map((item, index) => (
        <p key={index}>✔ {item}</p>
      ))
    ) : (
      <p>No major strengths identified.</p>
    )}
  </div>

  <div className="risk-box">
    <h3>Risk Factors</h3>
    {result.risk_factors && result.risk_factors.length > 0 ? (
      result.risk_factors.map((item, index) => (
        <p key={index}>⚠ {item}</p>
      ))
    ) : (
      <p>No significant risks detected.</p>
    )}
  </div>
</div>

<button className="primary-btn" onClick={handleSaveExit}>
  Save & Exit
</button>
      </div>
    </div>
  );
}

export default Result;