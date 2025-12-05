import React, { useState } from 'react';
import '../styles/PaymentSchedule.css';

const PaymentSchedule = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  
  if (!data || !data.schedule || data.schedule.length === 0) {
    return (
      <div className="payment-schedule">
        <h3 className="schedule-title">График платежей</h3>
        <div className="empty-schedule">
          <p>Нет данных для отображения графика платежей</p>
        </div>
      </div>
    );
  }

  const totalYears = Math.ceil(data.formData?.loanTerm || 20);
  const years = Array.from({ length: Math.min(5, totalYears) }, (_, i) => i + 1);
  
  const getYearSchedule = (year) => {
    const startMonth = (year - 1) * 12;
    const endMonth = Math.min(startMonth + 12, data.schedule.length);
    return data.schedule.slice(startMonth, endMonth);
  };

  const currentSchedule = getYearSchedule(selectedYear);
  const yearTotal = currentSchedule.reduce((sum, row) => sum + row.payment, 0);
  const yearInterest = currentSchedule.reduce((sum, row) => sum + row.interest, 0);
  const yearPrincipal = currentSchedule.reduce((sum, row) => sum + row.principal, 0);

  const formatCurrency = (value) => {
    return Math.round(value).toLocaleString('ru-RU') + ' ₽';
  };

  const exportToCSV = () => {
    if (!data || !data.schedule || data.schedule.length === 0) {
      alert('Нет данных для экспорта. Сначала выполните расчет ипотеки.');
      return;
    }

    // Заголовки
    const headers = ['Месяц', 'Платеж (руб)', 'Проценты (руб)', 'Основной долг (руб)', 'Остаток долга (руб)'];
    
    // Форматируем данные - убираем запятые из чисел
    const formatNumber = (num) => {
      return Math.round(num).toString(); // Просто число без форматирования
    };

    const rows = data.schedule.map((row) => [
      row.month,
      formatNumber(row.payment),
      formatNumber(row.interest),
      formatNumber(row.principal),
      formatNumber(row.balance)
    ]);

    // Добавляем итоговую строку
    const totalPayment = data.schedule.reduce((sum, row) => sum + row.payment, 0);
    const totalInterest = data.schedule.reduce((sum, row) => sum + row.interest, 0);
    const totalPrincipal = data.schedule.reduce((sum, row) => sum + row.principal, 0);
    
    rows.push(['ИТОГО', 
      formatNumber(totalPayment),
      formatNumber(totalInterest),
      formatNumber(totalPrincipal),
      '0'
    ]);

    // Создаем CSV содержимое
    const csvContent = [
      'ИПОТЕЧНЫЙ РАСЧЕТ',
      `Название: ${data.title || 'Без названия'}`,
      `Дата экспорта: ${new Date().toLocaleDateString('ru-RU')}`,
      '',
      'ОСНОВНЫЕ ПАРАМЕТРЫ',
      `Стоимость недвижимости: ${Math.round(data.formData?.propertyPrice || 0)} руб`,
      `Первоначальный взнос: ${Math.round(data.formData?.downPayment || 0)} руб`,
      `Срок кредита: ${data.formData?.loanTerm || 0} лет`,
      `Процентная ставка: ${data.formData?.interestRate || 0}%`,
      `Тип платежа: ${data.formData?.paymentType === 'annuity' ? 'Аннуитетный' : 'Дифференцированный'}`,
      '',
      'ГРАФИК ПЛАТЕЖЕЙ',
      headers.join(';'),
      ...rows.map(row => row.join(';')),
      '',
      'ПРИМЕЧАНИЕ:',
      'Данный расчет является предварительным. Фактические условия кредитования могут отличаться.'
    ].join('\n');

    // Создаем и скачиваем файл
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `график_платежей_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    return (
      <div className="schedule-chart-compact">
        <div className="chart-container-compact">
          {currentSchedule.map((row, index) => (
            <div key={row.month} className="chart-bar-group-compact">
              <div className="chart-bar-label-compact">{row.month}</div>
              <div className="chart-bars-compact">
                <div 
                  className="chart-bar-compact principal"
                  style={{ height: `${(row.principal / row.payment) * 100}%` }}
                  title={`Основной долг: ${formatCurrency(row.principal)}`}
                ></div>
                <div 
                  className="chart-bar-compact interest"
                  style={{ 
                    height: `${(row.interest / row.payment) * 100}%`,
                    bottom: `${(row.principal / row.payment) * 100}%`
                  }}
                  title={`Проценты: ${formatCurrency(row.interest)}`}
                ></div>
              </div>
              <div className="chart-total-compact">{formatCurrency(row.payment)}</div>
            </div>
          ))}
        </div>
        <div className="chart-legend-compact">
          <div className="legend-item-compact">
            <div className="legend-color-compact principal"></div>
            <span>Основной долг</span>
          </div>
          <div className="legend-item-compact">
            <div className="legend-color-compact interest"></div>
            <span>Проценты</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="payment-schedule">
      <div className="schedule-header">
        <h3 className="schedule-title">График платежей</h3>
        <div className="schedule-controls">
          <button 
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Таблица
          </button>
          <button 
            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            График
          </button>
        </div>
      </div>

      <div className="year-selector">
        <div className="year-label">Год:</div>
        <div className="year-buttons">
          {years.map(year => (
            <button
              key={year}
              className={`year-btn ${selectedYear === year ? 'active' : ''}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
          {totalYears > 5 && (
            <select 
              className="year-dropdown"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: totalYears }, (_, i) => i + 1)
                .slice(5)
                .map(year => (
                  <option key={year} value={year}>
                    Год {year}
                  </option>
                ))
              }
            </select>
          )}
        </div>
      </div>

      <div className="year-summary-compact">
        <div className="summary-card-compact">
          <div className="summary-label-compact">Платежи за {selectedYear} год</div>
          <div className="summary-value-compact">{formatCurrency(yearTotal)}</div>
        </div>
        <div className="summary-card-compact">
          <div className="summary-label-compact">Проценты</div>
          <div className="summary-value-compact accent">{formatCurrency(yearInterest)}</div>
        </div>
        <div className="summary-card-compact">
          <div className="summary-label-compact">Основной долг</div>
          <div className="summary-value-compact">{formatCurrency(yearPrincipal)}</div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="schedule-table-compact">
          <div className="table-header-compact">
            <div className="table-cell-header">Месяц</div>
            <div className="table-cell-header">Платеж</div>
            <div className="table-cell-header">Проценты</div>
            <div className="table-cell-header">Основной долг</div>
            <div className="table-cell-header">Остаток</div>
          </div>
          <div className="table-body-compact">
            {currentSchedule.map((row) => (
              <div key={row.month} className="table-row-compact">
                <div className="table-cell-compact">{row.month}</div>
                <div className="table-cell-compact">{formatCurrency(row.payment)}</div>
                <div className="table-cell-compact accent">{formatCurrency(row.interest)}</div>
                <div className="table-cell-compact">{formatCurrency(row.principal)}</div>
                <div className="table-cell-compact">{formatCurrency(row.balance)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        renderChart()
      )}

      <div className="schedule-footer-compact">
        <div className="trend-info-compact">
          <div className="trend-item-compact">
            <span className="trend-label-compact">Первый платеж:</span>
            <span className="trend-value-compact">{formatCurrency(currentSchedule[0]?.payment || 0)}</span>
          </div>
          <div className="trend-item-compact">
            <span className="trend-label-compact">Последний платеж:</span>
            <span className="trend-value-compact">
              {formatCurrency(currentSchedule[currentSchedule.length - 1]?.payment || 0)}
            </span>
          </div>
          {data.formData?.paymentType === 'differential' && (
            <div className="trend-item-compact">
              <span className="trend-label-compact">Снижение:</span>
              <span className="trend-value-compact">
                {formatCurrency((currentSchedule[0]?.payment || 0) - (currentSchedule[currentSchedule.length - 1]?.payment || 0))}
              </span>
            </div>
          )}
        </div>
        
        <button className="export-btn-compact" onClick={exportToCSV}>
          Экспорт CSV
        </button>
      </div>
    </div>
  );
};

export default PaymentSchedule;