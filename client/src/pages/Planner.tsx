import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Award } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Planner() {
  return (
    <ProtectedRoute>
      <PlannerContent />
    </ProtectedRoute>
  );
}

function PlannerContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    { id: 1, title: "Complete Math Chapter 5", subject: "Mathematics", dueDate: "2025-01-30", completed: false, xpReward: 25 },
    { id: 2, title: "Study for Chemistry Quiz", subject: "Science", dueDate: "2025-01-28", completed: false, xpReward: 30 },
    { id: 3, title: "Write English Essay", subject: "English", dueDate: "2025-02-01", completed: true, xpReward: 40 },
    { id: 4, title: "History Project Research", subject: "History", dueDate: "2025-02-05", completed: false, xpReward: 35 },
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    dueDate: "",
    xpReward: 10,
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  if (!user) return null;

  const subjects = ["Mathematics", "Science", "English", "History", "Other"];

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const addTask = () => {
    if (!newTask.title) return;

    const task = {
      id: Date.now(),
      title: newTask.title,
      subject: newTask.subject || "Other",
      dueDate: newTask.dueDate,
      completed: false,
      xpReward: newTask.xpReward,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", subject: "", dueDate: "", xpReward: 10 });
    setDialogOpen(false);
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const totalPendingXP = pendingTasks.reduce((sum, task) => sum + task.xpReward, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Study Planner</h1>
          <p className="text-muted-foreground">
            Organize your tasks and earn XP for completion
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-task">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Complete Math Homework"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  data-testid="input-task-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={newTask.subject} onValueChange={(value) => setNewTask({ ...newTask, subject: value })}>
                  <SelectTrigger data-testid="select-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  data-testid="input-due-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xpReward">XP Reward</Label>
                <Input
                  id="xpReward"
                  type="number"
                  min="1"
                  value={newTask.xpReward}
                  onChange={(e) => setNewTask({ ...newTask, xpReward: parseInt(e.target.value) || 10 })}
                  data-testid="input-xp-reward"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addTask} data-testid="button-save-task">
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Tasks</p>
              <p className="text-3xl font-bold">{pendingTasks.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completed Tasks</p>
              <p className="text-3xl font-bold text-primary">{completedTasks.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available XP</p>
              <p className="text-3xl font-bold text-secondary">{totalPendingXP}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-primary" />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending tasks. Great job!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover-elevate group"
                  data-testid={`task-${task.id}`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0"
                    data-testid={`button-toggle-task-${task.id}`}
                  >
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold mb-1">{task.title}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="text-xs">
                        {task.subject}
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                      <Badge className="text-xs gap-1">
                        <Award className="h-3 w-3" />
                        +{task.xpReward} XP
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-delete-task-${task.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 group"
                  data-testid={`task-completed-${task.id}`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0"
                    data-testid={`button-toggle-task-${task.id}`}
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary fill-primary" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold mb-1 line-through text-muted-foreground">
                      {task.title}
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="text-xs">
                        {task.subject}
                      </Badge>
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Award className="h-3 w-3" />
                        +{task.xpReward} XP Earned
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-delete-task-${task.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
