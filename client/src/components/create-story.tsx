import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUpload } from "@/hooks/use-upload";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Camera, ImageIcon, Type, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StoryMode = "image" | "text";

interface CreateStoryProps {
  open: boolean;
  onClose: () => void;
}

export function CreateStory({ open, onClose }: CreateStoryProps) {
  const [mode, setMode] = useState<StoryMode>("image");
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { uploadFile, isUploading } = useUpload();

  const createMutation = useMutation({
    mutationFn: async (data: { mediaUrl?: string; mediaType: string; content?: string; visibility: string; expiresAt: string }) => {
      await apiRequest("POST", "/api/stories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories/feed"] });
      toast({ title: "Story posted" });
      resetAndClose();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to post story", description: err.message, variant: "destructive" });
    },
  });

  const resetAndClose = () => {
    setText("");
    setImagePreview(null);
    setImageFile(null);
    setMode("image");
    setVisibility("public");
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    if (mode === "text") {
      if (!text.trim()) {
        toast({ title: "Please enter some text", variant: "destructive" });
        return;
      }
      createMutation.mutate({
        mediaType: "text",
        content: text.trim(),
        visibility,
        expiresAt: expiresAt.toISOString(),
      });
    } else {
      if (!imageFile) {
        toast({ title: "Please select an image", variant: "destructive" });
        return;
      }
      const result = await uploadFile(imageFile);
      if (!result) {
        toast({ title: "Upload failed", variant: "destructive" });
        return;
      }
      const mediaType = imageFile.type.startsWith("video/") ? "video" : "image";
      createMutation.mutate({
        mediaUrl: result.objectPath,
        mediaType,
        content: text.trim() || undefined,
        visibility,
        expiresAt: expiresAt.toISOString(),
      });
    }
  };

  const isPending = isUploading || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetAndClose(); }}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-create-story">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "image" ? "default" : "outline"}
            onClick={() => setMode("image")}
            className="flex-1 toggle-elevate"
            data-testid="button-story-mode-image"
          >
            <ImageIcon className="h-4 w-4 mr-1.5" />
            Photo
          </Button>
          <Button
            variant={mode === "text" ? "default" : "outline"}
            onClick={() => setMode("text")}
            className="flex-1 toggle-elevate"
            data-testid="button-story-mode-text"
          >
            <Type className="h-4 w-4 mr-1.5" />
            Text
          </Button>
        </div>

        {mode === "image" && (
          <div className="space-y-3">
            {imagePreview ? (
              <div className="relative rounded-md overflow-hidden aspect-[9/16] max-h-64 bg-muted">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" data-testid="img-story-preview" />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-black/40 text-white hover:bg-black/60"
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                  data-testid="button-remove-story-image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[9/16] max-h-64 border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-2 text-muted-foreground hover-elevate transition-colors"
                data-testid="button-upload-story-image"
              >
                <Camera className="h-8 w-8" />
                <span className="text-sm font-medium">Tap to select photo or video</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
              data-testid="input-story-file"
            />
          </div>
        )}

        {mode === "text" && (
          <div className="rounded-md bg-gradient-to-br from-purple-600 via-rose-500 to-orange-500 p-4 aspect-[9/16] max-h-64 flex items-center justify-center">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your story..."
              className="bg-transparent border-0 text-white placeholder:text-white/60 text-center text-lg font-bold resize-none focus-visible:ring-0 h-full"
              maxLength={280}
              data-testid="input-story-text"
            />
          </div>
        )}

        {mode === "image" && imagePreview && (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a caption (optional)..."
            className="resize-none"
            maxLength={280}
            data-testid="input-story-caption"
          />
        )}

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Who can see this?</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger data-testid="select-story-visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Everyone</SelectItem>
              <SelectItem value="followers">Followers only</SelectItem>
              <SelectItem value="private">Only me</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={resetAndClose} className="flex-1" data-testid="button-cancel-story">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1"
            data-testid="button-post-story"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Share Story
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
