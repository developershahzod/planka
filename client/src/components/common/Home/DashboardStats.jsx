/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors'; // Убедись, что путь правильный
import styles from './DashboardStats.module.scss';

const DashboardStats = () => {
  const tasks = useSelector(selectors.selectTasks);

  // Группировка задач по статусам
  const taskStats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    const now = Date.now();

    tasks.forEach((task) => {
      if (task.isCompleted) {
        completed++;
      } else {
        inProgress++;
        if (task.dueDate && new Date(task.dueDate).getTime() < now) {
          overdue++;
        }
      }
    });

    return [
      { name: 'Завершено', value: completed, color: '#4caf50' },
      { name: 'В процессе', value: inProgress, color: '#ff9800' },
      { name: 'Просрочено', value: overdue, color: '#f44336' },
    ];
  }, [tasks]);

  const totalTasks = taskStats.reduce((sum, t) => sum + t.value, 0);
  const progressPercent = totalTasks
    ? Math.round((taskStats[0].value / totalTasks) * 100)
    : 0;

  // Активность по дням недели
  const activityData = useMemo(() => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const map = new Array(7).fill(0);

    tasks.forEach((task) => {
      const date = new Date(task.createdAt);
      const day = date.getDay();
      map[day]++;
    });

    return map.map((count, i) => ({
      day: days[i],
      tasks: count,
    }));
  }, [tasks]);

  return (
    <div className={styles.wrapper}>
      {/* Статистика задач */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Статистика задач</h2>
        {taskStats.map((item) => (
          <div key={item.name} className={styles.statRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: item.color,
                  borderRadius: '50%',
                }}
              />
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
          <div
            style={{
              textAlign: 'right',
              marginTop: 4,
              color: '#4caf50',
              fontWeight: 500,
            }}
          >
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
                style={{
                  width: `${item.tasks * 10}%`,
                  backgroundColor: '#2196f3',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
