import React, { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import styles from './DashboardStats.module.scss';

const DashboardStats = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = 'https://planka-production-f920.up.railway.app';
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjkxN2QwYjYyLWVkMTgtNDk0Ni04NWY3LWNkNTBmZjhiMTAzMSJ9.eyJpYXQiOjE3NDkyMTg1OTAsImV4cCI6MTc4MDc1NDU5MCwic3ViIjoiMTUyNjA4NjAzNjg4MTQwOTAyNSJ9.igEi53ojUkV95-45axj70lEtatyO-rxnBfysmBXFwxc';

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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

  const activityData = useMemo(() => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
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

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (loading) return <div>Загрузка задач...</div>;

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

      {/* Таблица задач */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Список задач</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Название</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 10).map((task, index) => (
                <tr key={task.id}>
                  <td>{index + 1}</td>
                  <td>{task.name}</td>
                  <td>
                    {task.isCompleted ? (
                      <span className={styles.statusCompleted}>Завершено</span>
                    ) : task.dueDate &&
                      new Date(task.dueDate).getTime() < Date.now() ? (
                      <span className={styles.statusOverdue}>Просрочено</span>
                    ) : (
                      <span className={styles.statusInProgress}>В процессе</span>
                    )}
                  </td>
                  <td>{formatDate(task.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
