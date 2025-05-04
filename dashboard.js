// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Sample data - in a real app, this would come from your backend
    const userData = {
        name: "John Doe",
        assessments: [
            { date: "2023-01-15", score: 8, level: "moderate" },
            { date: "2023-04-22", score: 6, level: "moderate" },
            { date: "2023-07-30", score: 10, level: "high" },
            { date: "2023-10-05", score: 12, level: "high" }
        ],
        currentAssessment: {
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
    };

    // Initialize charts
    initRiskGauge(userData.currentAssessment.score);
    initHistoryChart(userData.assessments);
    initBreakdownChart(userData.currentAssessment.factors);
    
    // Populate risk factors
    populateRiskFactors(userData.currentAssessment.factors);
    
    // Populate recommendations
    populateRecommendations(userData.currentAssessment.recommendations);
    
    // Set up event listeners
    document.getElementById('new-assessment').addEventListener('click', startNewAssessment);
});

// Initialize the risk gauge chart
function initRiskGauge(score) {
    const ctx = document.getElementById('riskGauge').getContext('2d');
    
    // Gauge configuration
    const gaugeData = {
        datasets: [{
            data: [score, 20-score],
            backgroundColor: [
                getRiskColor(score),
                '#f5f5f5'
            ],
            borderWidth: 0,
            circumference: 240,
            rotation: 270,
            cutout: '80%'
        }]
    };

    const gaugeOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
                display: true,
                formatter: (value, ctx) => {
                    return ctx.dataIndex === 0 ? `${value}/20` : '';
                },
                color: '#333',
                font: {
                    size: 24,
                    weight: 'bold'
                },
                anchor: 'center',
                align: 'center'
            }
        }
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: gaugeData,
        options: gaugeOptions,
        plugins: [ChartDataLabels]
    });
}

// Initialize assessment history chart
function initHistoryChart(assessments) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    const labels = assessments.map(a => {
        const date = new Date(a.date);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    const data = assessments.map(a => a.score);
    const backgroundColors = assessments.map(a => getRiskColor(a.score));
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Risk Score',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: '#1a6fc9',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 20,
                    title: {
                        display: true,
                        text: 'Risk Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Assessment Date'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = assessments[context.dataIndex];
                            return `Score: ${data.score}/20 (${data.level} risk)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize risk breakdown chart
function initBreakdownChart(factors) {
    const ctx = document.getElementById('breakdownChart').getContext('2d');
    
    // Sort factors by contribution
    const sortedFactors = [...factors].sort((a, b) => (b.value/b.max) - (a.value/a.max));
    const displayFactors = sortedFactors.slice(0, 6);
    
    const labels = displayFactors.map(f => f.name);
    const data = displayFactors.map(f => f.value);
    const maxValues = displayFactors.map(f => f.max);
    const backgroundColors = displayFactors.map(f => {
        const ratio = f.value / f.max;
        if (ratio >= 0.75) return '#e74c3c';
        if (ratio >= 0.5) return '#f39c12';
        return '#27ae60';
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Your Score',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => shadeColor(c, -20)),
                borderWidth: 1
            }, {
                label: 'Max Possible',
                data: maxValues,
                backgroundColor: 'rgba(149, 165, 166, 0.2)',
                borderColor: 'rgba(149, 165, 166, 0.8)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Points'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const factor = displayFactors[context.dataIndex];
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += `${context.raw}/${factor.max}`;
                            if (factor.details) label += ` ${factor.details}`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Populate risk factors list
function populateRiskFactors(factors) {
    const container = document.getElementById('top-factors');
    container.innerHTML = '';
    
    // Sort by contribution
    const sortedFactors = [...factors].sort((a, b) => (b.value/b.max) - (a.value/a.max));
    
    sortedFactors.forEach(factor => {
        const ratio = factor.value / factor.max;
        let importanceClass = '';
        if (ratio >= 0.75) importanceClass = 'high';
        else if (ratio >= 0.5) importanceClass = 'medium';
        else importanceClass = 'low';
        
        const factorEl = document.createElement('div');
        factorEl.className = `factor-item ${importanceClass}`;
        
        let icon = '';
        if (importanceClass === 'high') icon = '<i class="fas fa-exclamation-circle"></i>';
        else if (importanceClass === 'medium') icon = '<i class="fas fa-exclamation"></i>';
        else icon = '<i class="fas fa-info-circle"></i>';
        
        let details = factor.details ? `<span class="factor-details">${factor.details}</span>` : '';
        
        factorEl.innerHTML = `
            ${icon}
            <div class="factor-info">
                <div class="factor-name">${factor.name}</div>
                <div class="factor-score">${factor.value}/${factor.max} points</div>
                ${details}
            </div>
        `;
        
        container.appendChild(factorEl);
    });
}

// Populate recommendations list
function populateRecommendations(recommendations) {
    const container = document.getElementById('recommendations-list');
    container.innerHTML = '';
    
    recommendations.forEach((rec, index) => {
        const recEl = document.createElement('div');
        recEl.className = 'recommendation-item';
        recEl.innerHTML = `
            <i class="fas fa-chevron-circle-right"></i>
            <div class="recommendation-text">${rec}</div>
        `;
        container.appendChild(recEl);
    });
}

// Start new assessment
function startNewAssessment() {
    // In a real app, this would navigate to the assessment form
    alert('Starting new assessment... Redirecting to assessment form.');
}

// Helper function to get risk color based on score
function getRiskColor(score) {
    if (score >= 10) return '#e74c3c';
    if (score >= 6) return '#f39c12';
    return '#27ae60';
}

// Helper function to shade colors
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}
