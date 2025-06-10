module.exports = {
  friendlyName: 'Show tasks by user',
  description: 'Returns tasks assigned to the current user with project, board, and assignee info',

  exits: {
    success: {
      description: 'Tasks retrieved successfully',
    },
  },

  fn: async function () {
    const userId = this.req.query.userId;

    const tasks = await Task.find({ assigneeUserId: userId });

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        // Получаем taskList
        let taskList = null;
        if (task.taskListId) {
          taskList = await TaskList.find({ id: task.taskListId });
        }

        // Получаем board
        let board = null;
        if (taskList && taskList.boardId) {
          board = await Board.find({ id: taskList.boardId });
        }

        // Получаем project
        let project = null;
        if (board && board.projectId) {
          project = await Project.find({ id: board.projectId });
        }

        // Получаем пользователя
        const assignee = task.assigneeUserId
          ? await User.find({ id: task.assigneeUserId })
          : null;

        return {
          id: task.id,
          name: task.name,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          taskListId: task.taskListId || null,
          assigneeUserId: task.assigneeUserId || null,

          // ✨ Новые поля
          boardName: board ? board.name : null,
          projectName: project ? project.name : null,
          assigneeUsername: assignee ? assignee.username : null,
        };
      })
    );

    return tasksWithDetails;
  },
};
