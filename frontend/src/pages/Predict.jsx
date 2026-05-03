import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

function Predict() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sslc_percentage: "",
    plus_two_percentage: "",
    backlogs_count: "",
    year_gap: "",
    internship_count: "",
    certification_count: "",
    project_count: "",
    skilled_score: "",
    test_score: "",
    number_of_semesters: 6,
    sgpa_1: "",
    sgpa_2: "",
    sgpa_3: "",
    sgpa_4: "",
    sgpa_5: "",
    sgpa_6: "",
    sgpa_7: "",
    sgpa_8: ""
  });

  const labels = {
    sslc_percentage: "SSLC %",
    plus_two_percentage: "Plus Two %",
    backlogs_count: "Backlogs",
    year_gap: "Year Gap",
    internship_count: "Internships",
    certification_count: "Certifications",
    project_count: "Projects",
    skilled_score: "Skill Score",
    test_score: "Test Score",
    number_of_semesters: "No. of Semesters"
  };

  const handleClose = () => navigate("/");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {};
    Object.keys(formData).forEach((k) => {
      payload[k] = Number(formData[k]) || formData[k];
    });

    const res = await axios.post("http://127.0.0.1:5000/predict", payload);
    localStorage.setItem("prediction_result", JSON.stringify(res.data));
    navigate("/result");
  };

  return (
    <div className="page">
      <button className="close-btn" onClick={handleClose}>×</button>

      <div className="form-card wide-card">
        <h1>Student Placement Details</h1>
        <p className="sub-text">Enter academic, skill, and experience details.</p>

        <form onSubmit={handleSubmit} className="form-grid">
          {Object.keys(labels).map((key) => (
            <div className="input-box" key={key}>
              <label>{labels[key]}</label>
              <input
                type="number"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className="section-title">Semester SGPA</div>

          {[1,2,3,4,5,6,7,8].map((i) => (
            <div className="input-box" key={i}>
              <label>SGPA {i}</label>
              <input
                type="number"
                step="0.01"
                name={`sgpa_${i}`}
                value={formData[`sgpa_${i}`]}
                onChange={handleChange}
              />
            </div>
          ))}

          <button type="submit" className="primary-btn">Predict</button>
        </form>
      </div>
    </div>
  );
}

export default Predict;