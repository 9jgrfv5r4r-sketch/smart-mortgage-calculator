import React, { useState } from 'react';
import '../styles/SavedCalculations.css';

const SavedCalculations = ({ calculations, onLoad, onDelete, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filteredCalculations = calculations
    .filter(calc => 
      calc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.propertyPrice.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.id) - new Date(a.id);
      if (sortBy === 'price') return b.propertyPrice - a.propertyPrice;
      if (sortBy === 'payment') return b.monthlyPayment - a.monthlyPayment;
      return 0;
    });

  const formatCurrency = (value) => {
    return value.toLocaleString('ru-RU') + ' ₽';
  };

  if (calculations.length === 0) {
    return (
      <div className="saved-calculations-empty">
        <h3>Нет сохраненных расчетов</h3>
        <p>Сохраняйте расчеты, чтобы просматривать их здесь</p>
      </div>
    );
  }

  return (
    <div className="saved-calculations">
      <div className="saved-header">
        <h2>Сохраненные расчеты ({calculations.length})</h2>
        
        <div className="saved-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по названию или цене..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="sort-controls">
            <label>Сортировка:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">По дате</option>
              <option value="price">По стоимости</option>
              <option value="payment">По платежу</option>
            </select>
          </div>
          
          <button 
            className="btn-clear-all"
            onClick={onClearAll}
            disabled={calculations.length === 0}
          >
            🗑️ Очистить все
          </button>
        </div>
      </div>

      <div className="calculations-list">
        {filteredCalculations.map((calc) => (
          <div key={calc.id} className="calculation-card">
            <div className="card-header">
              <h4 className="calc-title">{calc.title}</h4>
              <span className="calc-date">{calc.date}</span>
            </div>
            
            <div className="calc-details">
              <div className="detail-row">
                <span className="detail-label">Стоимость:</span>
                <span className="detail-value">{formatCurrency(calc.propertyPrice)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Первоначальный взнос:</span>
                <span className="detail-value">{formatCurrency(calc.downPayment)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Срок:</span>
                <span className="detail-value">{calc.loanTerm} лет</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ставка:</span>
                <span className="detail-value">{calc.interestRate}%</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Платеж:</span>
                <span className="detail-value highlight">
                  {formatCurrency(Math.round(calc.monthlyPayment || 0))}/мес
                </span>
              </div>
            </div>
            
            <div className="card-actions">
              <button 
                className="btn-load"
                onClick={() => onLoad(calc)}
              >
                📝 Загрузить
              </button>
              <button 
                className="btn-delete"
                onClick={() => onDelete(calc.id)}
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCalculations.length === 0 && calculations.length > 0 && (
        <div className="no-results">
          <p>По запросу "{searchTerm}" ничего не найдено</p>
          <button onClick={() => setSearchTerm('')}>Показать все</button>
        </div>
      )}
    </div>
  );
};

export default SavedCalculations;