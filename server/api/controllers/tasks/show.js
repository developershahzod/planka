module.exports = {
  friendlyName: 'Show tasks by user',
  description: 'Returns tasks assigned to user with project, board, and assignee info',

  exits: {
    success: { description: 'Tasks retrieved successfully' },
  },

  fn: async function () {
    const userId = this.req.query.userId;

    const tasks = await Task.find({ assigneeUserId: userId });

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const taskList = await TaskList.findOne({ id: task.taskListId });
        const board = taskList && taskList.boardId 
          ? await Board.findOne({ id: taskList.boardId }) 
          : null;
        const project = board && board.projectId
          ? await Project.findOne({ id: board.projectId })
          : null;
        const assignee = task.assigneeUserId
          ? await User.findOne({ id: task.assigneeUserId })
          : null;

        return {
          id: task.id,
          name: task.name,
          position: task.position,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          taskListId: task.taskListId,
          assigneeUserId: task.assigneeUserId,

          boardName: board?.name || null,
          projectName: project?.name || null,
          assigneeUserName: assignee?.username || null,
        };
      })
    );

    return tasksWithDetails;
  },
};
