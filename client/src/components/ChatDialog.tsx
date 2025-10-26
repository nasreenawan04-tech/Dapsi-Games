import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  Smile, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Image as ImageIcon,
  Loader2,
  ZoomIn
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  sendMessage, 
  subscribeToConversation, 
  markMessagesAsRead,
  subscribeToUserStatus,
  setTypingStatus,
  subscribeToTypingStatus,
  addMessageReaction,
  removeMessageReaction,
  deleteMessage,
  editMessage,
  uploadMessageImage,
} from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friend: {
    id: string;
    name: string;
    email: string;
    xp?: number;
    level?: string;
  };
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export function ChatDialog({ open, onOpenChange, friend }: ChatDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !open) return;

    const unsubscribeMessages = subscribeToConversation(
      user.id,
      friend.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setTimeout(scrollToBottom, 100);
      }
    );

    const unsubscribeStatus = subscribeToUserStatus(friend.id, (status) => {
      setIsOnline(status.isOnline);
      setLastSeen(status.lastSeen);
    });

    const conversationId = [user.id, friend.id].sort().join('_');
    const unsubscribeTyping = subscribeToTypingStatus(
      conversationId,
      user.id,
      setIsTyping
    );

    markMessagesAsRead(user.id, friend.id);

    return () => {
      unsubscribeMessages();
      unsubscribeStatus();
      unsubscribeTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, friend.id, open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (!user) return;
    
    const conversationId = [user.id, friend.id].sort().join('_');
    
    if (text.trim()) {
      setTypingStatus(conversationId, user.id, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(conversationId, user.id, false);
      }, 3000);
    } else {
      setTypingStatus(conversationId, user.id, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadMessageImage(file, user.id, (progress) => {
        setUploadProgress(progress);
      });

      await sendMessage(user.id, friend.id, messageText.trim() || "📷 Photo", imageUrl);
      setMessageText("");
      
      toast({
        title: "Image sent",
        description: "Your image has been shared successfully",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async () => {
    if (!user || !messageText.trim() || sending) return;

    const conversationId = [user.id, friend.id].sort().join('_');
    setTypingStatus(conversationId, user.id, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setSending(true);
    try {
      await sendMessage(user.id, friend.id, messageText.trim());
      setMessageText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const reactions = message.reactions || {};
    const userReacted = reactions[emoji]?.includes(user.id);

    try {
      if (userReacted) {
        await removeMessageReaction(messageId, user.id, emoji);
      } else {
        await addMessageReaction(messageId, user.id, emoji);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast({
        title: "Success",
        description: "Message deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (messageId: string) => {
    if (!editText.trim()) return;

    try {
      await editMessage(messageId, editText.trim());
      setEditingMessageId(null);
      setEditText("");
      toast({
        title: "Success",
        description: "Message updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      });
    }
  };

  const startEdit = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditText(currentText);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes > 0) return `${minutes}m ago`;
      return "Just now";
    }
  };

  const formatFullTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = () => {
    if (isOnline) return "Online";
    if (!lastSeen) return "Offline";
    
    const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `Active ${minutes}m ago`;
    if (hours < 24) return `Active ${hours}h ago`;
    if (days === 1) return "Active yesterday";
    if (days < 7) return `Active ${days}d ago`;
    return "Offline";
  };

  const groupMessagesByDate = (messages: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    messages.forEach(message => {
      const date = message.createdAt?.toDate ? message.createdAt.toDate() : new Date(message.createdAt);
      const dateKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    {friend.name?.[0]}{friend.name?.split(" ")[1]?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg">{friend.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{formatLastSeen()}</p>
                  <Badge variant="outline" className="text-xs">{friend.level || "Novice"}</Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground px-2 bg-background">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {dateMessages.map((message, index) => {
                    const isOwn = message.fromUserId === user?.id;
                    const showAvatar = !isOwn && (
                      index === 0 || 
                      dateMessages[index - 1].fromUserId !== message.fromUserId
                    );
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 group`}
                        data-testid={`message-${message.id}`}
                      >
                        {showAvatar && !isOwn && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="text-xs">
                              {friend.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {!showAvatar && !isOwn && <div className="w-10" />}
                        
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          {editingMessageId === message.id ? (
                            <div className="w-full flex gap-2">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleEdit(message.id);
                                  }
                                }}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="icon"
                                variant="default"
                                onClick={() => handleEdit(message.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditText("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="relative group/message">
                              <div
                                className={`rounded-2xl shadow-sm transition-all ${
                                  message.type === 'image' ? 'p-1' : 'px-4 py-2'
                                } ${
                                  isOwn
                                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                                } ${message.deleted ? 'italic opacity-60' : ''}`}
                              >
                                {message.type === 'image' && message.imageUrl ? (
                                  <div className="relative">
                                    <img 
                                      src={message.imageUrl} 
                                      alt="Shared image" 
                                      className="rounded-xl max-w-full max-h-80 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => setPreviewImage(message.imageUrl)}
                                      loading="lazy"
                                    />
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/message:opacity-100 transition-opacity"
                                      onClick={() => setPreviewImage(message.imageUrl)}
                                    >
                                      <ZoomIn className="h-4 w-4" />
                                    </Button>
                                    {message.text && message.text !== "📷 Photo" && (
                                      <p className={`text-sm mt-2 px-3 pb-2 ${isOwn ? 'text-primary-foreground' : ''}`}>
                                        {message.text}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
                                )}
                                {message.edited && !message.deleted && (
                                  <span className="text-xs opacity-60 ml-2">(edited)</span>
                                )}
                                
                                {isOwn && !message.deleted && message.type !== 'image' && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -right-8 top-1 h-6 w-6 opacity-0 group-hover/message:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => startEdit(message.id, message.text)}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDelete(message.id)} className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              
                              {!message.deleted && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {EMOJIS.slice(0, 3).map(emoji => {
                                    const reactions = message.reactions || {};
                                    const count = reactions[emoji]?.length || 0;
                                    const userReacted = reactions[emoji]?.includes(user?.id);
                                    
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleReaction(message.id, emoji)}
                                        className={`text-xs px-2 py-1 rounded-full transition-all ${
                                          count > 0
                                            ? userReacted
                                              ? 'bg-primary/20 border border-primary'
                                              : 'bg-muted border border-border'
                                            : 'opacity-0 group-hover/message:opacity-100 bg-muted/50 hover:bg-muted'
                                        }`}
                                      >
                                        {emoji} {count > 0 && count}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                                title={formatFullTime(message.createdAt)}
                              >
                                {formatTime(message.createdAt)}
                                {isOwn && message.read && (
                                  <span className="ml-1">✓✓</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="text-xs">
                      {friend.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {uploading && (
            <div className="px-6 py-2">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Uploading image...</p>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
            </div>
          )}

          <div className="p-4 border-t bg-muted/20">
            {showEmojiPicker && (
              <div className="mb-2 flex gap-1 flex-wrap p-2 bg-background rounded-lg border">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessageText(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-2xl p-2 hover:bg-muted rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                data-testid="button-upload-image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                data-testid="button-emoji-picker"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending || uploading}
                className="flex-1 bg-background"
                data-testid="input-message"
              />
              <Button
                onClick={handleSend}
                disabled={!messageText.trim() || sending || uploading}
                size="icon"
                className="bg-gradient-to-r from-primary to-primary/80"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl p-0">
            <div className="relative">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setPreviewImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
