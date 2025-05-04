const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get assessment data
app.get('/api/assessments', (req, res) => {
    // In a real app, this would fetch from a database
    res.json({
        assessments: [
            { date: "2023-01-15", score: 8, level: "moderate" },
            { date: "2023-04-22", score: 6, level: "moderate" },
            { date: "2023-07-30", score: 10, level: "high" },
            { date: "2023-10-05", score: 12, level: "high" }
        ],
        current: {
            score: 12,
            level: "high",
            factors: [
                { name: "Type 2 Diabetes", value: 3, max: 4 },
                { name: "Hypertension", value: 2, max: 2 },
                { name: "Age (60+)", value: 3, max: 3 },
                { name: "BMI ≥30", value: 1, max: 1 },
                { name: "Family History", value: 1, max: 2, details: "(Diabetes, Hypertension)" },
                { name: "Symptoms", value: 2, max: 2 }
            ],
            recommendations: [
                "Consult with your doctor about kidney function tests (eGFR and urine albumin)",
                "Strict control of blood pressure (target <130/80 mmHg)",
                "Optimal diabetes management (target A1C <7%)",
                "Regular monitoring of kidney function (at least annually)",
                "Dietary modifications (reduce sodium, moderate protein intake)",
                "Weight management (current BMI 32)"
            ]
        }
    });
});

// All other routes serve the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
