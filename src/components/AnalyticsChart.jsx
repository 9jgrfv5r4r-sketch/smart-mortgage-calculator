import React from 'react';
import '../styles/AnalyticsChart.css';

const AnalyticsChart = ({ data }) => {
  if (!data) return null;

  const { loanAmount, totalInterest, totalCost, formData } = data;
  
  if (!loanAmount || !totalInterest || !totalCost) return null;

  const chartData = [
    { name: 'Тело кредита', value: loanAmount, color: 'var(--color-accent-blue)' },
    { name: 'Проценты', value: totalInterest, color: 'var(--color-accent-orange)' }
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const principalPercentage = ((loanAmount / totalCost) * 100).toFixed(1);
  const interestPercentage = ((totalInterest / totalCost) * 100).toFixed(1);

  const formatCurrency = (value) => {
    return Math.round(value).toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <div className="analytics-chart">
      <div className="chart-header">
        <h3 className="chart-title">Распределение платежей</h3>
        <div className="chart-subtitle">Структура общей стоимости кредита</div>
      </div>
      
      <div className="chart-content-compact">
        <div className="pie-chart-container">
          <div className="pie-chart">
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const offset = chartData
                .slice(0, index)
                .reduce((sum, i) => sum + (i.value / total) * 360, 0);
              
              return (
                <div
                  key={item.name}
                  className="pie-segment"
                  style={{
                    '--percentage': `${percentage}%`,
                    '--offset': `${offset}deg`,
                    '--color': item.color
                  }}
                >
                  <div className="segment-fill"></div>
                </div>
              );
            })}
            <div className="chart-center">
              <div className="center-value">{principalPercentage}%</div>
              <div className="center-label">Тело кредита</div>
            </div>
          </div>
        </div>
        
        <div className="chart-details-compact">
          {chartData.map(item => {
            const itemPercentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.name} className="detail-item-compact">
                <div className="detail-info">
                  <div className="detail-color" style={{ backgroundColor: item.color }}></div>
                  <div className="detail-name">{item.name}</div>
                </div>
                <div className="detail-numbers">
                  <div className="detail-value">{formatCurrency(item.value)}</div>
                  <div className="detail-percentage">{itemPercentage}%</div>
                </div>
              </div>
            );
          })}
          
          <div className="detail-item-compact">
            <div className="detail-info">
              <div className="detail-name" style={{ fontWeight: '600' }}>Общая стоимость</div>
            </div>
            <div className="detail-numbers">
              <div className="detail-value total">{formatCurrency(totalCost)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="chart-stats-compact">
        <div className="stat-card-compact">
          <div className="stat-icon-compact">📈</div>
          <div className="stat-label-compact">Переплата в %</div>
          <div className="stat-value-compact">
            {((totalInterest / loanAmount) * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="stat-card-compact">
          <div className="stat-icon-compact">💰</div>
          <div className="stat-label-compact">Коэффициент переплаты</div>
          <div className="stat-value-compact">
            {(totalInterest / loanAmount).toFixed(2)}
          </div>
        </div>
        
        <div className="stat-card-compact">
          <div className="stat-icon-compact">⏱️</div>
          <div className="stat-label-compact">Эффективная ставка</div>
          <div className="stat-value-compact">
            {((totalInterest / loanAmount / (formData?.loanTerm || 20)) * 100).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;