import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Image, Mic, BarChart3, X, Plus, Trash2, Upload, Square, Loader2, MessageCircleOff, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const avatarColors = [
  "bg-orange-500", "bg-emerald-500", "bg-violet-500", "bg-sky-500",
  "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-indigo-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

type PostMode = "text" | "image" | "video" | "audio" | "poll";

export function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState<PostMode>("text");
  const charLimit = 500;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showAudioOptions, setShowAudioOptions] = useState(false);

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, []);

  const resetForm = () => {
    setContent("");
    setIsFocused(false);
    setMode("text");
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedAudio(null);
    setAudioName("");
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setIsRecording(false);
    setRecordingTime(0);
    setShowAudioOptions(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setCommentsEnabled(true);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const uploadFile = async (file: File, prefix: string): Promise<string> => {
    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${prefix}_${Date.now()}.${ext}`;
    const res = await apiRequest("POST", "/api/uploads/request-url", { filename, contentType: file.type });
    const { signedUrl, objectName } = await res.json();
    await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    return `/objects/${objectName}`;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = "";
      let videoUrl = "";
      let audioUrl = "";
      let postType = mode;

      if (mode === "image" && selectedImage) {
        imageUrl = await uploadFile(selectedImage, "post_img");
      }
      if (mode === "video" && selectedImage) {
        videoUrl = await uploadFile(selectedImage, "post_vid");
      }
      if (mode === "audio" && selectedAudio) {
        audioUrl = await uploadFile(selectedAudio, "post_audio");
      }

      const body: any = {
        content: content || (mode === "poll" ? pollQuestion : ""),
        postType,
        commentsEnabled,
      };
      if (imageUrl) body.imageUrl = imageUrl;
      if (videoUrl) body.videoUrl = videoUrl;
      if (audioUrl) body.audioUrl = audioUrl;
      if (mode === "poll") {
        body.pollQuestion = pollQuestion;
        body.pollOptions = pollOptions.filter(o => o.trim());
        body.pollVotes = body.pollOptions.map(() => 0);
      }

      await apiRequest("POST", "/api/posts", body);
    },
    onSuccess: () => {
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trending"] });
      toast({ title: "Post published!" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to post", description: error.message, variant: "destructive" });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      if (isVideo && file.size > 100 * 1024 * 1024) {
        toast({ title: "Video must be under 100MB", variant: "destructive" });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setMode(isVideo ? "video" : "image");
      setIsFocused(true);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/m4a", "audio/webm", "audio/x-m4a"];
    if (!file.type.startsWith("audio/") && !validTypes.includes(file.type)) {
      toast({ title: "Please select an audio file (MP3, WAV, OGG, etc.)", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "Audio file must be under 20MB", variant: "destructive" });
      return;
    }
    setSelectedAudio(file);
    setAudioName(file.name);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(URL.createObjectURL(file));
    setMode("audio");
    setIsFocused(true);
    setShowAudioOptions(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const ext = mediaRecorder.mimeType.includes("webm") ? "webm" : "ogg";
        const file = new File([blob], `voice_${Date.now()}.${ext}`, { type: mediaRecorder.mimeType });
        setSelectedAudio(file);
        setAudioName(`Voice recording (${formatTime(recordingTime)})`);
        if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        setMode("audio");
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setShowAudioOptions(false);
      setIsFocused(true);

      const startTime = Date.now();
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access to record audio", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const canSubmit = () => {
    if (createMutation.isPending) return false;
    if (mode === "text") return content.trim().length > 0;
    if (mode === "image" || mode === "video") return !!selectedImage;
    if (mode === "audio") return !!selectedAudio;
    if (mode === "poll") {
      const validOptions = pollOptions.filter(o => o.trim()).length;
      return pollQuestion.trim().length > 0 && validOptions >= 2;
    }
    return false;
  };

  if (!user) return null;

  const isExpanded = isFocused || content.length > 0 || mode !== "text";

  return (
    <div className="border-b px-4 py-3" data-testid="create-post">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
          <AvatarFallback className={cn("text-white text-sm font-semibold", getAvatarColor(user.displayName))}>
            {getInitials(user.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {mode === "poll" ? (
            <div className="space-y-3">
              <Input
                placeholder="Ask a question..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="text-sm"
                data-testid="input-poll-question"
              />
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                      className="text-sm flex-1"
                      data-testid={`input-poll-option-${i}`}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removePollOption(i)}
                        data-testid={`button-remove-option-${i}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={addPollOption}
                  data-testid="button-add-option"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Option
                </Button>
              )}
              <Textarea
                placeholder="Add context (optional)"
                className="min-h-[40px] resize-none border text-sm bg-transparent"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
                data-testid="input-poll-context"
              />
            </div>
          ) : (
            <>
              <Textarea
                placeholder="What's happening in Bharat?"
                className="min-h-[60px] resize-none border-0 text-sm focus-visible:ring-0 bg-transparent"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
                onFocus={() => setIsFocused(true)}
                data-testid="input-post-content"
              />
              {(mode === "image" || mode === "video") && imagePreview && (
                <div className="mt-2 relative">
                  {mode === "video" ? (
                    <video
                      src={imagePreview}
                      controls
                      className="w-full max-h-60 rounded-xl border bg-black"
                      data-testid="video-preview"
                    />
                  ) : (
                    <img src={imagePreview} alt="Preview" className="w-full max-h-60 object-cover rounded-xl border" />
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80"
                    onClick={() => { setSelectedImage(null); setImagePreview(null); setMode("text"); }}
                    data-testid="button-remove-image"
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </Button>
                  {mode === "video" && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                      Video · Will appear in Reels
                    </div>
                  )}
                </div>
              )}

              {isRecording && (
                <div className="mt-2 flex items-center gap-3 p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-mono font-medium text-red-500">{formatTime(recordingTime)}</span>
                  <span className="text-xs text-muted-foreground flex-1">Recording...</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={stopRecording}
                    className="h-7 gap-1"
                    data-testid="button-stop-recording"
                  >
                    <Square className="h-3 w-3" /> Stop
                  </Button>
                </div>
              )}

              {mode === "audio" && selectedAudio && !isRecording && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/50">
                    <Mic className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs truncate flex-1">{audioName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => {
                        setSelectedAudio(null);
                        setAudioName("");
                        if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
                        setAudioPreviewUrl(null);
                        setMode("text");
                      }}
                      data-testid="button-remove-audio"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {audioPreviewUrl && (
                    <audio controls className="w-full h-8" src={audioPreviewUrl} data-testid="audio-preview" />
                  )}
                </div>
              )}
            </>
          )}

          {isExpanded && (
            <div className="mt-2 flex items-center justify-between gap-1">
              <div className="flex items-center gap-0.5 relative">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleImageSelect}
                  data-testid="input-file-image"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", mode === "image" && "text-primary")}
                  onClick={() => imageInputRef.current?.click()}
                  title="Image/Video"
                  disabled={isRecording}
                  data-testid="button-attach-image"
                >
                  <Image className="h-4 w-4" />
                </Button>

                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a,audio/webm,.mp3,.wav,.ogg,.aac,.m4a"
                  className="hidden"
                  onChange={handleAudioSelect}
                  data-testid="input-file-audio"
                />

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8", (mode === "audio" || isRecording) && "text-primary")}
                    onClick={() => {
                      if (isRecording) {
                        stopRecording();
                      } else {
                        setShowAudioOptions(!showAudioOptions);
                        setIsFocused(true);
                      }
                    }}
                    title="Audio"
                    data-testid="button-attach-audio"
                  >
                    {isRecording ? (
                      <Square className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>

                  {showAudioOptions && !isRecording && (
                    <div className="absolute bottom-full left-0 mb-1 bg-popover border rounded-lg shadow-lg p-1 z-50 min-w-[160px]">
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        data-testid="button-record-voice"
                      >
                        <Mic className="h-4 w-4 text-red-500" />
                        Record Voice
                      </button>
                      <button
                        onClick={() => { audioInputRef.current?.click(); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        data-testid="button-upload-audio-file"
                      >
                        <Upload className="h-4 w-4 text-primary" />
                        Upload Audio File
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", mode === "poll" && "text-primary")}
                  onClick={() => { setMode(mode === "poll" ? "text" : "poll"); setIsFocused(true); setShowAudioOptions(false); }}
                  title="Poll"
                  disabled={isRecording}
                  data-testid="button-create-poll"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", !commentsEnabled && "text-destructive")}
                  onClick={() => setCommentsEnabled(!commentsEnabled)}
                  title={commentsEnabled ? "Comments enabled" : "Comments disabled"}
                  disabled={isRecording}
                  data-testid="button-toggle-comments"
                >
                  {commentsEnabled ? <MessageCircle className="h-4 w-4" /> : <MessageCircleOff className="h-4 w-4" />}
                </Button>

                {mode !== "text" && !isRecording && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground ml-1"
                    onClick={resetForm}
                    data-testid="button-cancel-mode"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs",
                  content.length > charLimit * 0.9 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {content.length}/{charLimit}
                </span>
                <Button
                  size="sm"
                  onClick={() => createMutation.mutate()}
                  disabled={!canSubmit() || isRecording}
                  data-testid="button-submit-post"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1.5" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
