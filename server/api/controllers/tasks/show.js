module.exports = {
  friendlyName: 'Show tasks by user',
  description: 'Returns tasks assigned to the current user or all if no userId provided',

  exits: {
    success: {
      description: 'Tasks retrieved successfully',
    },
  },

  fn: async function () {
    const userId = this.req.query.userId;

    const criteria = userId ? { assigneeUserId: userId } : {};

    const tasks = await Task.find(criteria)
      .populate('taskListId');

    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const taskList = task.taskListId;
        const board = taskList ? await Board.findOne({ id: taskList.boardId }) : null;
        const project = board ? await Project.findOne({ id: board.projectId }) : null;

        return {
          id: task.id,
          taskListId: task.taskListId?.id,
          name: task.name,
          position: task.position,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          assigneeUserId: task.assigneeUserId,
          boardName: board?.name || null,
          projectName: project?.name || null,
        };
      })
    );

    return enrichedTasks;
  },
};
