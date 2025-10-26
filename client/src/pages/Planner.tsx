import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle2, Circle, Trash2, Calendar, Award, Download, Search, Filter, Clock, Star, Edit, TrendingUp, AlertCircle, ChevronDown } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { createTask, getUserTasks, updateTask, deleteTask as deleteTaskFromDB } from "@/lib/firebase";
import { completeTaskViaAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LevelUpModal } from "@/components/LevelUpModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: any; // Firebase Timestamp
  xpReward: number;
  priority: "high" | "medium" | "low";
  description?: string;
  timeEstimate: number;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
}

export default function Planner() {
  return (
    <ProtectedRoute>
      <PlannerContent />
    </ProtectedRoute>
  );
}

function PlannerContent() {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ newLevel: "", currentXP: 0 });
  const { toast } = useToast();

  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    dueDate: "",
    xpReward: 10,
    priority: "medium",
    description: "",
    timeEstimate: 30,
    difficulty: "medium",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userTasks = await getUserTasks(user.id);
      setTasks(userTasks as Task[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const subjects = ["Mathematics", "Science", "English", "History", "Computer Science", "Art", "Music", "Other"];
  const priorities = ["low", "medium", "high"];
  const difficulties = ["easy", "medium", "hard"];

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        const result = await completeTaskViaAPI(taskId, user!.id);
        await refreshUser();
        toast({
          title: "Task Completed! 🎉",
          description: `You earned ${result.xpReward} XP!`,
        });

        if (result.leveledUp) {
          setTimeout(() => {
            setLevelUpData({ newLevel: result.level, currentXP: result.xp });
            setShowLevelUpModal(true);
          }, 500);
        }

        if (result.unlockedBadges && result.unlockedBadges.length > 0) {
          setTimeout(() => {
            toast({
              title: "🏆 New Badge Unlocked!",
              description: `You've earned ${result.unlockedBadges.length} new badge${result.unlockedBadges.length > 1 ? 's' : ''}!`,
            });
          }, result.leveledUp ? 3000 : 1000);
        }
      } else {
        await updateTask(taskId, { completed: false });
      }
      await loadTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTaskHandler = async (taskId: string) => {
    try {
      await deleteTaskFromDB(taskId);
      await loadTasks();
      toast({
        title: "Task Deleted",
        description: "The task has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const addTask = async () => {
    if (!newTask.title || !user) return;

    try {
      await createTask(user.id, newTask);
      await loadTasks();
      setNewTask({ 
        title: "", 
        subject: "", 
        dueDate: "", 
        xpReward: 10,
        priority: "medium",
        description: "",
        timeEstimate: 30,
        difficulty: "medium",
      });
      setDialogOpen(false);
      toast({
        title: "Task Created",
        description: "New task added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateTaskHandler = async () => {
    if (!editingTask || !editingTask.title) return;

    try {
      await updateTask(editingTask.id, {
        title: editingTask.title,
        subject: editingTask.subject,
        dueDate: editingTask.dueDate,
        xpReward: editingTask.xpReward,
        priority: editingTask.priority,
        description: editingTask.description,
        timeEstimate: editingTask.timeEstimate,
        difficulty: editingTask.difficulty,
      });
      await loadTasks();
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask({
      ...task,
      dueDate: task.dueDate && task.dueDate.toDate ? task.dueDate.toDate().toISOString().split('T')[0] : "",
    } as Task);
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubject = filterSubject === "all" || task.subject === filterSubject;
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      return matchesSearch && matchesSubject && matchesPriority;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.toDate().getTime() - b.dueDate.toDate().getTime();
      } else if (sortBy === "priority") {
        const priorityOrder: { [key: string]: number } = { high: 0, medium: 1, low: 2 };
        const aPriority = a.priority || "medium";
        const bPriority = b.priority || "medium";
        return (priorityOrder[aPriority] ?? 1) - (priorityOrder[bPriority] ?? 1);
      } else if (sortBy === "xp") {
        return b.xpReward - a.xpReward;
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [tasks, searchQuery, filterSubject, filterPriority, sortBy]);

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);
  const totalPendingXP = pendingTasks.reduce((sum, task) => sum + task.xpReward, 0);
  const totalTimeEstimate = pendingTasks.reduce((sum, task) => sum + (task.timeEstimate || 0), 0);

  // Subject stats
  const subjectStats = useMemo(() => {
    const stats: any = {};
    tasks.forEach(task => {
      if (!task.subject) return;
      if (!stats[task.subject]) {
        stats[task.subject] = { total: 0, completed: 0, xp: 0 };
      }
      stats[task.subject].total++;
      if (task.completed) {
        stats[task.subject].completed++;
        stats[task.subject].xp += task.xpReward;
      }
    });
    return stats;
  }, [tasks]);

  // Priority distribution
  const priorityCount = useMemo(() => {
    const count: { [key: string]: number } = { high: 0, medium: 0, low: 0 };
    pendingTasks.forEach(task => {
      const priority = task.priority || "medium";
      count[priority] = (count[priority] || 0) + 1;
    });
    return count;
  }, [pendingTasks]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.text("DapsiGames Study Planner", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Student: ${user?.name}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 36);
    doc.text(`Total Tasks: ${tasks.length} | Completed: ${completedTasks.length} | Pending: ${pendingTasks.length}`, 20, 42);
    
    if (pendingTasks.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Pending Tasks", 20, 55);
      
      const pendingData = pendingTasks.map((task, index) => [
        index + 1,
        task.title,
        task.subject || "N/A",
        task.priority?.toUpperCase() || "MEDIUM",
        task.dueDate && task.dueDate.toDate ? task.dueDate.toDate().toLocaleDateString() : "No due date",
        `${task.xpReward} XP`
      ]);
      
      autoTable(doc, {
        startY: 60,
        head: [["#", "Task", "Subject", "Priority", "Due Date", "XP"]],
        body: pendingData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
      });
    }
    
    if (completedTasks.length > 0) {
      const finalY = pendingTasks.length > 0 ? (doc as any).lastAutoTable.finalY + 15 : 60;
      
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.text("Completed Tasks ✓", 20, finalY);
      
      const completedData = completedTasks.map((task, index) => [
        index + 1,
        task.title,
        task.subject || "N/A",
        `${task.xpReward} XP Earned`
      ]);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [["#", "Task", "Subject", "XP Earned"]],
        body: completedData,
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 9 },
      });
    }
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const pageHeight = doc.internal.pageSize.height;
    doc.text("Generated by DapsiGames - Study Smarter, Play Harder", 20, pageHeight - 10);
    
    doc.save(`study-planner-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Exported! 📄",
      description: "Your study planner has been downloaded successfully.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive border-destructive";
      case "medium": return "text-amber-600 border-amber-600 dark:text-amber-500";
      case "low": return "text-blue-600 border-blue-600 dark:text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-3 w-3" />;
      case "medium": return <TrendingUp className="h-3 w-3" />;
      case "low": return <ChevronDown className="h-3 w-3" />;
      default: return null;
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const count = difficulty === "easy" ? 1 : difficulty === "hard" ? 3 : 2;
    return Array(count).fill(0).map((_, i) => (
      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
    ));
  };

  return (
    <>
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        newLevel={levelUpData.newLevel}
        currentXP={levelUpData.currentXP}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Study Planner</h1>
            <p className="text-muted-foreground">
              Organize your tasks, track progress, and earn XP
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={exportToPDF}
              disabled={tasks.length === 0}
              data-testid="button-export-pdf"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-task">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Complete Math Homework"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      data-testid="input-task-title"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
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
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={newTask.difficulty} onValueChange={(value) => setNewTask({ ...newTask, difficulty: value })}>
                        <SelectTrigger data-testid="select-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeEstimate">Time (mins)</Label>
                      <Input
                        id="timeEstimate"
                        type="number"
                        min="5"
                        step="5"
                        value={newTask.timeEstimate}
                        onChange={(e) => setNewTask({ ...newTask, timeEstimate: parseInt(e.target.value) || 30 })}
                        data-testid="input-time-estimate"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add notes or details about this task..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                      data-testid="input-description"
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
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={editingTask !== null} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Task Title *</Label>
                  <Input
                    id="edit-title"
                    placeholder="e.g., Complete Math Homework"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    data-testid="input-edit-task-title"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Select value={editingTask.subject} onValueChange={(value) => setEditingTask({ ...editingTask, subject: value })}>
                      <SelectTrigger data-testid="select-edit-subject">
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
                    <Label htmlFor="edit-dueDate">Due Date</Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={editingTask.dueDate}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                      data-testid="input-edit-due-date"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select value={editingTask.priority} onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as "high" | "medium" | "low" })}>
                      <SelectTrigger data-testid="select-edit-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-difficulty">Difficulty</Label>
                    <Select value={editingTask.difficulty} onValueChange={(value) => setEditingTask({ ...editingTask, difficulty: value as "easy" | "medium" | "hard" })}>
                      <SelectTrigger data-testid="select-edit-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-timeEstimate">Time (mins)</Label>
                    <Input
                      id="edit-timeEstimate"
                      type="number"
                      min="5"
                      step="5"
                      value={editingTask.timeEstimate}
                      onChange={(e) => setEditingTask({ ...editingTask, timeEstimate: parseInt(e.target.value) || 30 })}
                      data-testid="input-edit-time-estimate"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Add notes or details about this task..."
                    value={editingTask.description || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={3}
                    data-testid="input-edit-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-xpReward">XP Reward</Label>
                  <Input
                    id="edit-xpReward"
                    type="number"
                    min="1"
                    value={editingTask.xpReward}
                    onChange={(e) => setEditingTask({ ...editingTask, xpReward: parseInt(e.target.value) || 10 })}
                    data-testid="input-edit-xp-reward"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={updateTaskHandler} data-testid="button-update-task">
                Update Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Dashboard */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <Circle className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{pendingTasks.length}</p>
              <p className="text-xs text-muted-foreground mt-1">tasks to complete</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedTasks.length}</p>
              <p className="text-xs text-muted-foreground mt-1">tasks finished</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Available XP</p>
                <Award className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold text-secondary">{totalPendingXP}</p>
              <p className="text-xs text-muted-foreground mt-1">points to earn</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Time Needed</p>
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {Math.floor(totalTimeEstimate / 60)}h {totalTimeEstimate % 60}m
              </p>
              <p className="text-xs text-muted-foreground mt-1">estimated time</p>
            </CardContent>
          </Card>
        </div>

        {/* Priority Distribution */}
        {pendingTasks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">High Priority</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{priorityCount.high}</span>
                  </div>
                  <Progress value={(priorityCount.high / pendingTasks.length) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium">Medium Priority</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{priorityCount.medium}</span>
                  </div>
                  <Progress value={(priorityCount.medium / pendingTasks.length) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium">Low Priority</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{priorityCount.low}</span>
                  </div>
                  <Progress value={(priorityCount.low / pendingTasks.length) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subject Progress */}
        {Object.keys(subjectStats).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Subject Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(subjectStats).map(([subject, stats]: [string, any]) => (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{subject}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {stats.completed}/{stats.total} completed
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {stats.xp} XP
                        </Badge>
                      </div>
                    </div>
                    <Progress value={(stats.completed / stats.total) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-tasks"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2 sm:w-auto"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-xs">Subject</Label>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger data-testid="select-filter-subject">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Priority</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger data-testid="select-filter-priority">
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-testid="select-sort-by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="xp">XP Reward</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Lists */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending">
              Pending ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-1">No pending tasks</p>
                  <p className="text-sm">
                    {searchQuery || filterSubject !== "all" || filterPriority !== "all"
                      ? "Try adjusting your filters"
                      : "Great job! Add a new task to get started."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <Card key={task.id} className="hover-elevate group" data-testid={`task-${task.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleTask(task.id, task.completed)}
                          className="flex-shrink-0 mt-1"
                          data-testid={`button-toggle-task-${task.id}`}
                        >
                          <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-base">{task.title}</h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(task)}
                                data-testid={`button-edit-task-${task.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteTaskHandler(task.id)}
                                data-testid={`button-delete-task-${task.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {task.subject && (
                              <Badge variant="outline" className="text-xs">
                                {task.subject}
                              </Badge>
                            )}
                            {task.priority && (
                              <Badge variant="outline" className={`text-xs gap-1 ${getPriorityColor(task.priority)}`}>
                                {getPriorityIcon(task.priority)}
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                            )}
                            {task.difficulty && (
                              <Badge variant="outline" className="text-xs gap-1">
                                {getDifficultyStars(task.difficulty)}
                              </Badge>
                            )}
                            {task.dueDate && task.dueDate.toDate && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate.toDate().toLocaleDateString()}
                              </Badge>
                            )}
                            {task.timeEstimate && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Clock className="h-3 w-3" />
                                {task.timeEstimate} min
                              </Badge>
                            )}
                            <Badge className="text-xs gap-1">
                              <Award className="h-3 w-3" />
                              +{task.xpReward} XP
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-1">No completed tasks</p>
                  <p className="text-sm">Complete some tasks to see them here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <Card key={task.id} className="group bg-primary/5" data-testid={`task-completed-${task.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleTask(task.id, task.completed)}
                          className="flex-shrink-0 mt-1"
                          data-testid={`button-toggle-task-${task.id}`}
                        >
                          <CheckCircle2 className="h-6 w-6 text-primary fill-primary" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-base line-through text-muted-foreground">
                              {task.title}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteTaskHandler(task.id)}
                              data-testid={`button-delete-task-${task.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground/70 line-through mb-3">{task.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {task.subject && (
                              <Badge variant="outline" className="text-xs opacity-70">
                                {task.subject}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Award className="h-3 w-3" />
                              +{task.xpReward} XP Earned
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
