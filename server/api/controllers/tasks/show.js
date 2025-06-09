module.exports = {
  friendlyName: 'Show tasks by user',
  description: 'Returns tasks assigned to the current user, including board, project, and assignee username',

  exits: {
    success: {
      description: 'Tasks retrieved successfully',
    },
  },

  fn: async function () {
    const userId = this.req.query.userId;

    // Получаем все задачи пользователя
    const tasks = await Task.find({
      assigneeUserId: userId,
    });

    // Для каждого таска получаем связанные данные
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        try {
          const taskList = await TaskList.qm.getOneById(task.taskListId);
          const board = await Board.qm.getOneById(taskList.boardId);
          const project = await Project.qm.getOneById(board.projectId);
          const assignee = await User.qm.getOneById(task.assigneeUserId);

          return {
            id: task.id,
            taskListId: task.taskListId,
            name: task.name,
            position: task.position,
            isCompleted: task.isCompleted,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            assigneeUserId: task.assigneeUserId,
            boardId: board.id,
            projectId: project.id,

            // 🔥 дополнительные поля
            boardName: board.name,
            projectName: project.name,
            assigneeUsername: assignee.username,
          };
        } catch (err) {
          sails.log.warn(`❌ Ошибка при получении данных по задаче ${task.id}:`, err);
          return null;
        }
      })
    );

    // Удаляем невалидные таски (например, если board или project не найдены)
    const validTasks = tasksWithDetails.filter(Boolean);

    // Собираем список уникальных ID, чтобы не дублировать
    const projectIds = [...new Set(validTasks.map(t => t.projectId))];
    const boardIds = [...new Set(validTasks.map(t => t.boardId))];
    const userIds = [...new Set(validTasks.map(t => t.assigneeUserId))];

    // Загружаем все связанные данные одним махом
    const [projects, boards, users] = await Promise.all([
      Project.find({ id: projectIds }),
      Board.find({ id: boardIds }),
      User.find({ id: userIds }),
    ]);

    return {
      items: validTasks,
      included: {
        projects,
        boards,
        users: sails.helpers.users.presentMany(users, this.req.currentUser),
      },
    };
  },
};
