function doAction(history, redoStack, action) {
  history.push(action);
  while (redoStack.length > 0) {
    redoStack.pop();
  }
}

function undo(history, redoStack) {
  if (history.length === 0) {
    return null;
  }
  const action = history.pop();
  redoStack.push(action);
  return action;
}

function redo(history, redoStack) {
  if (redoStack.length === 0) {
    return null;
  }
  const action = redoStack.pop();
  history.push(action);
  return action;
}

const history = [];
const redoStack = [];
doAction(history, redoStack, "A");
doAction(history, redoStack, "B");
console.log(undo(history, redoStack), history, redoStack);
doAction(history, redoStack, "C");
console.log(redo(history, redoStack), history, redoStack);

module.exports = { doAction, undo, redo };
