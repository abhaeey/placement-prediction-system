from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import json
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load("placement_rf_model.pkl")
feature_names = joblib.load("feature_names.pkl")
feature_importance = joblib.load("feature_importance.pkl")

with open("model_metadata.json", "r") as f:
    metadata = json.load(f)

THRESHOLD = metadata.get("final_threshold", 0.5)


def calculate_consistency(sgpas):
    sgpas = [float(x) for x in sgpas if x is not None and str(x).strip() != ""]
    if len(sgpas) < 2:
        return 0

    mean = np.mean(sgpas)
    std = np.std(sgpas)

    if mean == 0:
        return 0

    consistency = 100 * (1 - (std / mean))
    return max(0, min(100, consistency))


def calculate_trend(sgpas):
    sgpas = [float(x) for x in sgpas if x is not None and str(x).strip() != ""]
    if len(sgpas) < 2:
        return 0

    x = np.arange(1, len(sgpas) + 1)
    slope = np.polyfit(x, sgpas, 1)[0]
    return slope


def get_category(probability):
    if probability >= 0.75:
        return "High Chance"
    elif probability >= 0.45:
        return "Moderate Chance"
    return "Low Chance"


def get_factor_summary(student_data):
    strengths = []
    risks = []

    if student_data["cgpa_percentage"] >= 75:
        strengths.append("Strong academic performance based on CGPA percentage.")
    elif student_data["cgpa_percentage"] < 50:
        risks.append("CGPA percentage is comparatively low.")

    if student_data["skilled_score"] >= 75:
        strengths.append("Good technical/domain skill score.")
    elif student_data["skilled_score"] < 50:
        risks.append("Skill score needs improvement.")

    if student_data["test_score"] >= 75:
        strengths.append("Strong performance in placement test.")
    elif student_data["test_score"] < 50:
        risks.append("Placement test score is low.")

    if student_data["backlogs_count"] == 0:
        strengths.append("No active backlogs.")
    elif student_data["backlogs_count"] > 2:
        risks.append("Backlog count may negatively affect placement readiness.")

    if student_data["year_gap"] == 0:
        strengths.append("No academic year gap.")
    elif student_data["year_gap"] > 1:
        risks.append("Year gap may reduce placement chances.")

    if student_data["internship_count"] >= 1:
        strengths.append("Internship exposure supports practical readiness.")
    else:
        risks.append("Lack of internship exposure.")

    if student_data["certification_count"] >= 2:
        strengths.append("Relevant certifications strengthen the profile.")
    else:
        risks.append("More relevant certifications can improve readiness.")

    if student_data["project_count"] >= 2:
        strengths.append("Project experience supports practical skills.")
    else:
        risks.append("More valid projects can improve employability.")

    if student_data["academic_consistency"] >= 90:
        strengths.append("Academic performance is consistent across semesters.")
    else:
        risks.append("Academic consistency can be improved.")

    if student_data["academic_trend"] > 0:
        strengths.append("Academic trend shows improvement over semesters.")
    else:
        risks.append("Academic trend is weak or declining.")

    return strengths[:5], risks[:5]


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Placement Prediction API is running"})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        number_of_semesters = int(data.get("number_of_semesters", 6))

        sgpas = []
        for i in range(1, 9):
            value = data.get(f"sgpa_{i}", "")
            if i <= number_of_semesters:
                sgpas.append(value)

        valid_sgpas = [float(x) for x in sgpas if str(x).strip() != ""]
        cgpa = np.mean(valid_sgpas)
        cgpa_percentage = cgpa * 9.5

        academic_consistency = calculate_consistency(sgpas)
        academic_trend = calculate_trend(sgpas)

        student_data = {
            "sslc_percentage": float(data.get("sslc_percentage", 0)),
            "plus_two_percentage": float(data.get("plus_two_percentage", 0)),
            "cgpa_percentage": cgpa_percentage,
            "backlogs_count": float(data.get("backlogs_count", 0)),
            "year_gap": float(data.get("year_gap", 0)),
            "internship_count": float(data.get("internship_count", 0)),
            "certification_count": float(data.get("certification_count", 0)),
            "project_count": float(data.get("project_count", 0)),
            "skilled_score": float(data.get("skilled_score", 0)),
            "test_score": float(data.get("test_score", 0)),
            "academic_consistency": academic_consistency,
            "academic_trend": academic_trend
        }

        input_df = pd.DataFrame([student_data])[feature_names]

        probability = model.predict_proba(input_df)[0][1]
        prediction = 1 if probability >= THRESHOLD else 0
        strengths, risks = get_factor_summary(student_data)

        return jsonify({
            "placement_probability": round(probability * 100, 2),
            "prediction": "Placed" if prediction == 1 else "Not Placed",
            "category": get_category(probability),
            "cgpa_percentage": round(cgpa_percentage, 2),
            "academic_consistency": round(academic_consistency, 2),
            "academic_trend": round(academic_trend, 4),
            "strengths": strengths,
            "risk_factors": risks
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)