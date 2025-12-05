import React, { useState, useEffect } from 'react';
import MortgageCalculator from '../components/MortgageCalculator';
import AnalyticsChart from '../components/AnalyticsChart';
import PaymentSchedule from '../components/PaymentSchedule';
import SavedCalculations from '../components/SavedCalculations';
import Modal from '../components/Modal';
import '../styles/HomePage.css';

const HomePage = () => {
  const [calculationResults, setCalculationResults] = useState(null);
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [activeView, setActiveView] = useState('graph');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загружаем сохраненные расчеты из localStorage при старте
  useEffect(() => {
    const saved = localStorage.getItem('mortgageCalculations');
    if (saved) {
      try {
        setSavedCalculations(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved calculations:', e);
      }
    }
  }, []);

  // Сохраняем расчеты при изменении
  useEffect(() => {
    localStorage.setItem('mortgageCalculations', JSON.stringify(savedCalculations));
  }, [savedCalculations]);

  const handleCalculate = (results) => {
    setCalculationResults(results);
  };

  const handleSave = (calculation) => {
    setSavedCalculations(prev => {
      const filtered = prev.filter(item => item.id !== calculation.id);
      const updated = [calculation, ...filtered];
      return updated;
    });
  };

  const handleLoad = (calculation) => {
    setCalculationResults(calculation);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setSavedCalculations(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Вы уверены, что хотите удалить все сохраненные расчеты?')) {
      setSavedCalculations([]);
    }
  };

  const formatCurrency = (value) => {
    return Math.round(value).toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <div className="home-page">
      <div className="background-elements">
        <div className="gradient-spot spot-1"></div>
        <div className="gradient-spot spot-2"></div>
      </div>

      <div className="main-content">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-gradient">Ипотечный</span>
              <span className="title-regular">Калькулятор</span>
            </h1>
            <p className="app-subtitle">
              Рассчитайте ипотеку онлайн с подробным графиком платежей и аналитикой
            </p>
          </div>

          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{savedCalculations.length}</div>
              <div className="stat-label">Сохранено</div>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
              <div className="stat-value">
                {calculationResults ? formatCurrency(calculationResults.monthlyPayment) : '—'}
              </div>
              <div className="stat-label">Платеж</div>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
              <div className="stat-value">
                {savedCalculations.length > 0 ? formatCurrency(
                  savedCalculations.reduce((sum, calc) => sum + calc.monthlyPayment, 0) / savedCalculations.length
                ) : '—'}
              </div>
              <div className="stat-label">Средний</div>
            </div>
          </div>
        </header>

        <div className="content-grid">
          <div className="main-panel">
            <MortgageCalculator 
              onCalculate={handleCalculate}
              onSave={handleSave}
              initialData={calculationResults?.formData}
            />
          </div>

          <div className="sidebar">
            <div className="sidebar-tabs">
              <button 
                className={`tab-btn ${activeView === 'graph' ? 'active' : ''}`}
                onClick={() => setActiveView('graph')}
              >
                График
              </button>
              <button 
                className={`tab-btn ${activeView === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveView('schedule')}
              >
                Платежи
              </button>
              <button 
                className={`tab-btn ${activeView === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveView('analytics')}
              >
                Аналитика
              </button>
            </div>

            <div className="sidebar-content">
              {calculationResults ? (
                <>
                  

                  {activeView === 'graph' && (
                    <AnalyticsChart data={calculationResults} />
                  )}
                  
                  {activeView === 'schedule' && (
                    <PaymentSchedule data={calculationResults} />
                  )}
                  
                  {activeView === 'analytics' && (
                    <div className="analytics-dashboard">
                      <h3 className="analytics-title">Ключевые показатели</h3>
                      <div className="analytics-grid">
                        {[
                          {
                            label: 'Эффективная ставка',
                            value: `${((calculationResults.totalInterest / calculationResults.loanAmount / calculationResults.formData.loanTerm) * 100).toFixed(2)}%`,
                            icon: '📊'
                          },
                          {
                            label: 'Коэффициент переплаты',
                            value: (calculationResults.totalInterest / calculationResults.loanAmount).toFixed(2),
                            icon: '💰'
                          },
                          {
                            label: 'Срок до 50% выплаты',
                            value: `${Math.round(calculationResults.schedule.length * 0.5 / 12)} лет`,
                            icon: '⏱️'
                          },
                          {
                            label: 'Первый год проценты',
                            value: calculationResults.schedule ? 
                              Math.round(calculationResults.schedule.slice(0, 12).reduce((sum, row) => sum + row.interest, 0)).toLocaleString('ru-RU') + ' ₽' : 
                              '—',
                            icon: '📈'
                          }
                        ].map((item, index) => (
                          <div key={index} className="analytics-card">
                            <div className="analytics-card-header">
                              <span className="analytics-icon">{item.icon}</span>
                              <span className="analytics-label">{item.label}</span>
                            </div>
                            <div className="analytics-value">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3 className="empty-title">Нет данных</h3>
                  <p className="empty-description">
                    Введите параметры ипотеки, чтобы увидеть график и аналитику
                  </p>
                </div>
              )}
            </div>

            <div className="saved-preview">
              <div className="preview-header">
                <h3 className="preview-title">Сохраненные расчеты</h3>
                <button 
                  className="preview-action"
                  onClick={() => setIsModalOpen(true)}
                >
                  Показать все
                </button>
              </div>
              
              <div className="preview-list">
                {savedCalculations.slice(0, 3).map(calc => (
                  <div 
                    key={calc.id} 
                    className="preview-item"
                    onClick={() => handleLoad(calc)}
                  >
                    <div className="preview-content">
                      <div className="preview-main">
                        <div className="preview-name">{calc.title}</div>
                        <div className="preview-date">{calc.date}</div>
                      </div>
                      <div className="preview-value">
                        {formatCurrency(calc.monthlyPayment)}
                      </div>
                    </div>
                    <div className="preview-progress">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min(100, (calc.downPayment / calc.propertyPrice) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {savedCalculations.length === 0 && (
                  <div className="empty-description" style={{ padding: '20px', textAlign: 'center' }}>
                    Нет сохраненных расчетов
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-info">
              <p className="footer-text">
                © 2025 SMART MORTGAGE. Все расчеты являются приблизительными.
              </p>
              <p className="footer-note">
                Актуальные условия кредита уточняйте в выбранном банке.
              </p>
            </div>
            
            <div className="footer-actions">
              <button className="footer-btn" onClick={() => window.print()}>
                Распечатать
              </button>
              <button className="footer-btn primary" onClick={() => setIsModalOpen(true)}>
                Все расчеты
              </button>
            </div>
          </div>
        </footer>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Сохраненные расчеты"
      >
        <SavedCalculations 
          calculations={savedCalculations}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
        />
      </Modal>
    </div>
  );
};

export default HomePage;