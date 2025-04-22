// finance.js
import { auth, db } from './js/firebase-config.js';

// Ray Dalio's Principles Configuration
const dalioPrinciples = {
    diversification: {
        assets: ["Stocks", "Real Estate", "Bonds", "Commodities", "Cash", "Crypto"],
        allocation: [30, 25, 20, 15, 5, 5] // Percentage allocation
    },
    riskManagement: {
        emergencyFund: 6, // Months of expenses
        debtRatio: 0.3 // Max debt-to-income ratio
    }
};

// Initialize Finance Module
export function initFinanceModule() {
    loadFinancialHealth();
    setupFinanceListeners();
    loadWealthBuildingStrategies();
    loadPurchaseGoals();
}

// Financial Health Dashboard
function loadFinancialHealth() {
    const userId = auth.currentUser.uid;
    
    db.collection('users').doc(userId).collection('finance')
        .doc('currentState').onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                updateFinancialOverview(data);
                createNetWorthProjection(data);
                generateAdvice(data);
            }
        });
}

function updateFinancialOverview(data) {
    // Current Financial State
    document.getElementById('current-savings').textContent = formatCurrency(data.savings);
    document.getElementById('monthly-income').textContent = formatCurrency(data.monthlyIncome);
    document.getElementById('net-worth').textContent = formatCurrency(data.netWorth);

    // Income Breakdown Chart
    new Chart(document.getElementById('incomeChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Fixed Income', 'Allowances', 'Variable Income'],
            datasets: [{
                data: [153000, 1684800, data.variableIncome || 0],
                backgroundColor: ['#4CAF50', '#2196F3', '#FF9800']
            }]
        }
    });
}

// Wealth Building Engine
function createNetWorthProjection(data) {
    const projectionYears = 10;
    const projections = [];
    let currentNetWorth = data.savings;
    const monthlyInvestment = data.monthlySavings * 0.7; // 70% of savings invested
    
    for (let year = 1; year <= projectionYears; year++) {
        currentNetWorth += (monthlyInvestment * 12);
        // Compound interest at conservative 10% annual return
        currentNetWorth *= 1.10; 
        projections.push(currentNetWorth);
    }

    new Chart(document.getElementById('netWorthChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({length: projectionYears}, (_, i) => `Year ${i+1}`),
            datasets: [{
                label: 'Projected Net Worth',
                data: projections,
                borderColor: '#6200ea',
                tension: 0.3
            }]
        }
    });
}

// Personalized Advice Generator
function generateAdvice(data) {
    const adviceContainer = document.getElementById('financial-advice');
    const emergencyFundTarget = data.monthlyExpenses * dalioPrinciples.riskManagement.emergencyFund;
    
    let adviceHTML = `
        <div class="advice-card critical">
            <h4>🛑 Immediate Action Required</h4>
            <p>Your current savings (₦${formatCurrency(data.savings)}) only cover 
            ${Math.round((data.savings/data.monthlyExpenses)*100)/100} months of expenses. 
            Build emergency fund to ₦${formatCurrency(emergencyFundTarget)} (6 months coverage).</p>
        </div>
        
        <div class="advice-card">
            <h4>💡 Dalio's Allocation Strategy</h4>
            <p>Based on your risk profile, allocate investments:</p>
            <ul>
                ${dalioPrinciples.diversification.assets.map((asset, index) => 
                    `<li>${asset}: ${dalioPrinciples.diversification.allocation[index]}%</li>`
                ).join('')}
            </ul>
        </div>
    `;

    if (data.savings/data.netWorth > 0.5) {
        adviceHTML += `
            <div class="advice-card warning">
                <h4>⚠️ Over-Liquidity Warning</h4>
                <p>You're holding too much cash (${Math.round(data.savings/data.netWorth*100)}% of net worth). 
                Allocate more to income-generating assets.</p>
            </div>
        `;
    }

    adviceContainer.innerHTML = adviceHTML;
}

// Savings Goal System
function setupFinanceListeners() {
    document.getElementById('saveGoalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const goal = {
            name: document.getElementById('goalName').value,
            target: parseFloat(document.getElementById('goalAmount').value),
            current: parseFloat(document.getElementById('currentSaved').value),
            deadline: new Date(document.getElementById('goalDeadline').value),
            created: new Date()
        };

        await db.collection('users').doc(auth.currentUser.uid)
            .collection('financialGoals').add(goal);
        
        // Reset form
        e.target.reset();
    });
}

// Purchase Tracking System
function loadPurchaseGoals() {
    const userId = auth.currentUser.uid;
    
    db.collection('users').doc(userId).collection('purchaseGoals')
        .onSnapshot(snapshot => {
            const container = document.getElementById('purchase-goals');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                const goal = doc.data();
                const progress = (goal.current / goal.target) * 100;
                const monthsLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30));
                
                const goalHTML = `
                    <div class="purchase-card">
                        <div class="purchase-header">
                            <h4>${goal.name}</h4>
                            <span>${progress.toFixed(1)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="purchase-meta">
                            <span>₦${formatCurrency(goal.current)}/₦${formatCurrency(goal.target)}</span>
                            <span>${monthsLeft} months left</span>
                        </div>
                        <div class="saving-plan">
                            Need to save ₦${formatCurrency((goal.target - goal.current)/monthsLeft)}/month
                        </div>
                    </div>
                `;
                
                container.insertAdjacentHTML('beforeend', goalHTML);
            });
        });
}

// Helper Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
    }).format(amount);
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('finance')) {
        initFinanceModule();
    }
});