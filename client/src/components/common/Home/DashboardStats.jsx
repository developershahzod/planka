import React from 'react';
import styles from './DashboardStats.module.scss';

import selectors from '../../../selectors';

const DashboardStats = () => {
  const taskStats = = useSelector(selectors.selectTasks);

  const activityData = [
    { day: 'Пн', tasks: 5 },
    { day: 'Вт', tasks: 8 },
    { day: 'Ср', tasks: 6 },
    { day: 'Чт', tasks: 10 },
    { day: 'Пт', tasks: 4 },
  ];

  const totalTasks = taskStats.reduce((sum, t) => sum + t.value, 0);
  const progressPercent = Math.round((taskStats[0].value / totalTasks) * 100);

  return (
    <div className={styles.wrapper}>
      
      {/* Статистика задач */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Статистика задач</h2>
        {taskStats.map((item) => (
          <div key={item.name} className={styles.statRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, backgroundColor: item.color, borderRadius: '50%' }} />
              <span>{item.name}</span>
            </div>
            <strong>{item.value}</strong>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          <div className={styles.progressBarBackground}>
            <div
              className={styles.progressBarValue}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: 4, color: '#4caf50', fontWeight: 500 }}>
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Активность по дням */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Активность по дням</h2>
        {activityData.map((item) => (
          <div key={item.day} style={{ marginBottom: 10 }}>
            <div className={styles.statRow}>
              <span>{item.day}</span>
              <span>{item.tasks} задач</span>
            </div>
            <div className={styles.progressBarBackground}>
              <div
                className={styles.activityBar}
                style={{ width: `${item.tasks * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
