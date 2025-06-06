export default function DashboardStats() {
  const taskStats = [
    { name: 'Завершено', value: 30, color: 'bg-green-400' },
    { name: 'В процессе', value: 15, color: 'bg-yellow-400' },
    { name: 'Просрочено', value: 5, color: 'bg-red-400' },
  ];

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
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Статистика задач */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Статистика задач</h2>
        <div className="space-y-2">
          {taskStats.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span>{item.name}</span>
              </div>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="mb-1 text-sm text-gray-500">Прогресс завершения</p>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-right font-medium text-green-600">
            {progressPercent}%
          </p>
        </div>
      </div>

      {/* Активность по дням */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Активность по дням</h2>
        <div className="space-y-2">
          {activityData.map((item) => (
            <div key={item.day}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.day}</span>
                <span>{item.tasks} задач</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${item.tasks * 10}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
