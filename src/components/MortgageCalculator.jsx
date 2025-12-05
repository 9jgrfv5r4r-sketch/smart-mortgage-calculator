import React, { useState, useEffect } from 'react';
import '../styles/Calculator.css';

const MortgageCalculator = ({ onCalculate, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    propertyPrice: initialData?.propertyPrice || 10000000,
    downPayment: initialData?.downPayment || 2000000,
    loanTerm: initialData?.loanTerm || 20,
    interestRate: initialData?.interestRate || 7.5,
    paymentType: initialData?.paymentType || 'annuity'
  });

  const [results, setResults] = useState(null);
  const [title, setTitle] = useState(initialData?.title || 'Новый расчет');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        propertyPrice: initialData.propertyPrice || 10000000,
        downPayment: initialData.downPayment || 2000000,
        loanTerm: initialData.loanTerm || 20,
        interestRate: initialData.interestRate || 7.5,
        paymentType: initialData.paymentType || 'annuity'
      });
      setTitle(initialData.title || 'Новый расчет');
    }
  }, [initialData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateMortgage();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [formData]);

  const calculateMortgage = () => {
    setIsCalculating(true);
    
    const loanAmount = formData.propertyPrice - formData.downPayment;
    const monthlyRate = formData.interestRate / 100 / 12;
    const totalPayments = formData.loanTerm * 12;

    let monthlyPayment = 0;
    let totalInterest = 0;
    let schedule = [];

    if (formData.paymentType === 'annuity') {
      if (monthlyRate > 0) {
        monthlyPayment = loanAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
          (Math.pow(1 + monthlyRate, totalPayments) - 1);
      } else {
        monthlyPayment = loanAmount / totalPayments;
      }
      
      let balance = loanAmount;
      for (let month = 1; month <= totalPayments; month++) {
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;
        balance -= principal;
        schedule.push({
          month,
          payment: monthlyPayment,
          principal,
          interest,
          balance: Math.max(balance, 0)
        });
      }
      
      totalInterest = monthlyPayment * totalPayments - loanAmount;
    } else {
      const principalPayment = loanAmount / totalPayments;
      let totalPaymentSum = 0;
      let balance = loanAmount;
      
      for (let month = 1; month <= totalPayments; month++) {
        const interest = balance * monthlyRate;
        const payment = principalPayment + interest;
        balance -= principalPayment;
        schedule.push({
          month,
          payment,
          principal: principalPayment,
          interest,
          balance: Math.max(balance, 0)
        });
        totalPaymentSum += payment;
      }
      
      monthlyPayment = schedule.reduce((sum, row) => sum + row.payment, 0) / schedule.length;
      totalInterest = totalPaymentSum - loanAmount;
    }

    const calculationResults = {
      monthlyPayment,
      totalInterest,
      loanAmount,
      totalCost: loanAmount + totalInterest,
      schedule,
      formData: { ...formData },
      title
    };

    setResults(calculationResults);
    onCalculate && onCalculate(calculationResults);
    
    setTimeout(() => setIsCalculating(false), 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setSaveStatus({ type: 'error', message: 'Введите название расчета' });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    const savedCalculation = {
      id: Date.now(),
      title,
      date: new Date().toLocaleString('ru-RU'),
      ...formData,
      ...results
    };
    
    if (onSave) {
      onSave(savedCalculation);
      setSaveStatus({ 
        type: 'success', 
        message: `Расчет сохранен` 
      });
      
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      propertyPrice: 10000000,
      downPayment: 2000000,
      loanTerm: 20,
      interestRate: 7.5,
      paymentType: 'annuity'
    });
    setTitle('Новый расчет');
  };

  const formatCurrency = (value) => {
    return Math.round(value).toLocaleString('ru-RU') + ' ₽';
  };

  const calculateDownPaymentPercent = () => {
    return ((formData.downPayment / formData.propertyPrice) * 100).toFixed(1);
  };

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <div className="header-left">
          <h2 className="calculator-title">Ипотечный калькулятор</h2>
          <p className="calculator-subtitle">Реальные расчеты в реальном времени</p>
        </div>
        
        <div className="header-right">
          <div className="save-section">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название расчета"
              className="title-input"
            />
            <button 
              onClick={handleSave} 
              className="save-btn"
              disabled={!results}
            >
              <span className="btn-text">Сохранить</span>
              <span className="btn-icon">→</span>
            </button>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div className={`save-status ${saveStatus.type}`}>
          <div className="status-content">
            <span className="status-icon">
              {saveStatus.type === 'success' ? '✓' : '!'}
            </span>
            <span className="status-text">{saveStatus.message}</span>
          </div>
        </div>
      )}

      <div className="calculator-grid">
        <div className="parameter-section">
          <div className="section-header">
            <h3 className="section-title">Основные параметры</h3>
            <div className="section-actions">
              <button className="action-btn" onClick={resetForm}>
                Сброс
              </button>
            </div>
          </div>
          
          <div className="parameters-grid">
            <div className="parameter-card">
              <div className="parameter-header">
                <label className="parameter-label">Стоимость недвижимости</label>
                <div className="parameter-value">{formatCurrency(formData.propertyPrice)}</div>
              </div>
              
              <input
                type="range"
                name="propertyPrice"
                value={formData.propertyPrice}
                onChange={handleChange}
                min="1000000"
                max="50000000"
                step="100000"
                className="range-input"
              />
              
              <div className="parameter-hints">
                <span>1M</span>
                <span>50M</span>
              </div>
            </div>

            <div className="parameter-card">
              <div className="parameter-header">
                <label className="parameter-label">Первоначальный взнос</label>
                <div className="parameter-value-group">
                  <div className="parameter-value">{formatCurrency(formData.downPayment)}</div>
                  <div className="parameter-percent">{calculateDownPaymentPercent()}%</div>
                </div>
              </div>
              
              <input
                type="range"
                name="downPayment"
                value={formData.downPayment}
                onChange={handleChange}
                min="0"
                max={formData.propertyPrice * 0.9}
                step="100000"
                className="range-input"
              />
              
              <div className="parameter-hints">
                <span>0%</span>
                <span>90%</span>
              </div>
            </div>

            <div className="parameter-card">
              <div className="parameter-header">
                <label className="parameter-label">Срок кредита</label>
                <div className="parameter-value">{formData.loanTerm} лет</div>
              </div>
              
              <input
                type="range"
                name="loanTerm"
                value={formData.loanTerm}
                onChange={handleChange}
                min="1"
                max="30"
                className="range-input"
              />
              
              <div className="parameter-hints">
                <span>1 год</span>
                <span>30 лет</span>
              </div>
            </div>

            <div className="parameter-card">
              <div className="parameter-header">
                <label className="parameter-label">Процентная ставка</label>
                <div className="parameter-value">{formData.interestRate}%</div>
              </div>
              
              <input
                type="range"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                min="1"
                max="20"
                step="0.1"
                className="range-input"
              />
              
              <div className="parameter-hints">
                <span>1%</span>
                <span>20%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="results-section">
          <div className="payment-type-section">
            <h3 className="section-title">Тип платежа</h3>
            
            <div className="payment-type-group">
              <button
                className={`payment-type-btn ${formData.paymentType === 'annuity' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, paymentType: 'annuity'})}
              >
                <div className="payment-type-content">
                  <div className="payment-type-name">Аннуитетный</div>
                  <div className="payment-type-desc">Равные платежи</div>
                </div>
                <div className="payment-type-indicator"></div>
              </button>
              
              <button
                className={`payment-type-btn ${formData.paymentType === 'differential' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, paymentType: 'differential'})}
              >
                <div className="payment-type-content">
                  <div className="payment-type-name">Дифференцированный</div>
                  <div className="payment-type-desc">Уменьшающиеся платежи</div>
                </div>
                <div className="payment-type-indicator"></div>
              </button>
            </div>
          </div>

          {results && (
            <div className="calculation-results">
              <div className="results-header">
                <h3 className="section-title">Результаты расчета</h3>
                {isCalculating && (
                  <div className="calculating-indicator">
                    <div className="calculating-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="main-result-card">
                <div className="main-result-content">
                  <div className="result-label">Ежемесячный платеж</div>
                  <div className="result-value-large">
                    {formatCurrency(results.monthlyPayment)}
                  </div>
                  <div className="result-hint">
                    {formData.paymentType === 'annuity' 
                      ? 'Фиксированная сумма каждый месяц' 
                      : 'Сумма уменьшается с каждым платежом'}
                  </div>
                </div>
                
                <div className="result-graph">
                  <div className="graph-bar">
                    <div 
                      className="graph-fill"
                      style={{ 
                        width: `${Math.min(100, (results.monthlyPayment / 200000) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="detailed-results">
                <div className="result-row">
                  <div className="result-item">
                    <div className="item-label">Сумма кредита</div>
                    <div className="item-value">{formatCurrency(results.loanAmount)}</div>
                  </div>
                  <div className="result-item">
                    <div className="item-label">Общая переплата</div>
                    <div className="item-value accent">
                      {formatCurrency(results.totalInterest)}
                    </div>
                  </div>
                </div>
                
                <div className="result-row">
                  <div className="result-item">
                    <div className="item-label">Переплата</div>
                    <div className="item-value">
                      {((results.totalInterest / results.loanAmount) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="item-label">Общая стоимость</div>
                    <div className="item-value">{formatCurrency(results.totalCost)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;