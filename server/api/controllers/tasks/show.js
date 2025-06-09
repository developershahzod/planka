fn: async function () {
  const userId = this.req.query.userId;

  const tasks = await Task.find({
    assigneeUserId: userId,
  });

  const tasksWithDetails = await Promise.all(
    tasks.map(async (task) => {
      try {
        const taskList = await TaskList.qm.getOneById(task.taskListId);
        const board = await Board.qm.getOneById(taskList.boardId);
        const project = await Project.qm.getOneById(board.projectId);

        return {
          id: task.id,
          name: task.name,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt,
          boardName: board.name,
          projectName: project.name,
        };
      } catch (err) {
        console.error(`Ошибка при обработке task.id=${task.id}:`, err);
        return null;
      }
    })
  );

  return tasksWithDetails.filter(Boolean);
}
