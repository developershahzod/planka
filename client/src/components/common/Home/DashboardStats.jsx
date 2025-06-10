import React, { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import styles from './DashboardStats.module.scss';
import { getAccessToken } from '../../../utils/access-token-storage';
import userApi from '../../../api/users';

const DashboardStats = () => {
  const [tasks, setTasks] = useState([]);
  const [tasksall, setTasksall] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchName, setSearchName] = useState('');
  const [searchProject, setSearchProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const BASE_URL = 'https://planka-production-f920.up.railway.app';

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = getAccessToken();
        const user = await userApi.getCurrentUser(false, { Authorization: `Bearer ${token}` });

        const response = await axios.get(`${BASE_URL}/api/tasks/show`, {
          params: { userId: user.item.id },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTasks(response.data);
      } catch (error) {
        console.log('Ошибка при загрузке задач:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks2 = async () => {
      try {
        const token = getAccessToken();
        const user = await userApi.getCurrentUser(false, { Authorization: `Bearer ${token}` });

        const response = await axios.get(`${BASE_URL}/api/tasks/show`, {
          params: { userId: undefined },
          headers: {
            Authorization: `Bearer ${token}` },
        });

        setTasksall(response.data);
      } catch (error) {
        console.log('Ошибка при загрузке всех задач:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    fetchTasks2();
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

  const filteredTasks = tasksall.filter((task) => {
    const nameMatch = task.name.toLowerCase().includes(searchName.toLowerCase());
    const projectMatch = task.projectName?.toLowerCase().includes(searchProject.toLowerCase());
    const now = Date.now();
    let statusMatch = true;

    if (filterStatus === 'completed') {
      statusMatch = task.isCompleted;
    } else if (filterStatus === 'inProgress') {
      statusMatch = !task.isCompleted && (!task.dueDate || new Date(task.dueDate).getTime() >= now);
    } else if (filterStatus === 'overdue') {
      statusMatch = !task.isCompleted && task.dueDate && new Date(task.dueDate).getTime() < now;
    }

    return nameMatch && projectMatch && statusMatch;
  });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (loading) return <div>Загрузка задач...</div>;

  return (
    <div className={styles.gridWrapper}>
      {/* Статистика */}
      {taskStats.map((item) => (
        <div key={item.name} className={styles.card}>
          <h2 className={styles.sectionTitle}>{item.name}</h2>
          <div className={styles.statRow}>
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
        </div>
      ))}

      {/* Активность */}
      <div className={`${styles.card} ${styles.activityBlock}`}>
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

      {/* Таблица пользователя */}
      <div className={`${styles.card} ${styles.tableBlock}`}>
        <h2 className={styles.sectionTitle}>Список задач</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Название</th>
                <th>Проект</th>
                <th>Доска</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 10).map((task, index) => (
                <tr key={task.id}>
                  <td>{index + 1}</td>
                  <td>{task.name}</td>
                  <td>{task.projectName}</td>
                  <td>{task.boardName}</td>
                  <td>
                    {task.isCompleted ? (
                      <span className={styles.statusCompleted}>Завершено</span>
                    ) : task.dueDate && new Date(task.dueDate).getTime() < Date.now() ? (
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

      {/* Таблица всех задач с фильтрами */}
      <div className={`${styles.card} ${styles.tableBlock}`} style={{ width: '100%', gridColumn: 'span 3' }}>
        <h2 className={styles.sectionTitle}>Все задачи, количество: {filteredTasks.length}</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Поиск по проекту..."
            value={searchProject}
            onChange={(e) => setSearchProject(e.target.value)}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="completed">Завершено</option>
            <option value="inProgress">В процессе</option>
            <option value="overdue">Просрочено</option>
          </select>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>ФИО</th>
                <th>Название</th>
                <th>Проект</th>
                <th>Доска</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <tr key={task.id}>
                  <td>{index + 1}</td>
                  <td>{task.assigneeUsername}</td>
                  <td>{task.name}</td>
                  <td>{task.projectName}</td>
                  <td>{task.boardName}</td>
                  <td>
                    {task.isCompleted ? (
                      <span className={styles.statusCompleted}>Завершено</span>
                    ) : task.dueDate && new Date(task.dueDate).getTime() < Date.now() ? (
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
