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

    const tasks = await Task.find({
      assigneeUserId: userId,
    });

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const taskList = await TaskList.findOne({ id: task.taskListId });
        const board = taskList ? await Board.findOne({ id: taskList.boardId }) : null;
        const project = board ? await Project.findOne({ id: board.projectId }) : null;
        const assignee = await User.findOne({ id: task.assigneeUserId });

        return {
          id: task.id,
          taskListId: task.taskListId,
          name: task.name,
          position: task.position,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          assigneeUserId: task.assigneeUserId,

          // 🔥 Добавляем имя доски, проекта и пользователя
          boardName: board ? board.name : null,
          projectName: project ? project.name : null,
          assigneeUsername: assignee ? assignee.username : null,
        };
      })
    );

    return tasksWithDetails;
  },
};
