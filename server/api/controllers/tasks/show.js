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
        // 1. TaskList
        const taskList = task.taskListId
          ? await TaskList.findOne({ id: task.taskListId })
          : null;

        // 2. Card
        const card = taskList && taskList.cardId
          ? await Card.findOne({ id: taskList.cardId })
          : null;

        // 3. Board
        const board = card && card.boardId
          ? await Board.findOne({ id: card.boardId })
          : null;

        // 4. Project
        const project = board && board.projectId
          ? await Project.findOne({ id: board.projectId })
          : null;

        // 5. Assignee user
        const assignee = task.assigneeUserId
          ? await User.findOne({ id: task.assigneeUserId })
          : null;

        return {
          id: task.id,
          name: task.name,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          taskListId: task.taskListId || null,
          assigneeUserId: task.assigneeUserId || null,

          // ✨ Добавленные данные
          boardName: board ? board.name : null,
          projectName: project ? project.name : null,
          assigneeUsername: assignee ? assignee.username : null,
        };
      })
    );

    return tasksWithDetails;
  },
};
