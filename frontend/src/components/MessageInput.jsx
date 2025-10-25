import { useRef, useState, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, VideoIcon, Camera } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const { sendMessage, isSoundEnabled, replyToMessage, setReplyToMessage } = useChatStore();

  const inputRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !videoPreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
      video: videoPreview,
    });
    setText("");
    setImagePreview("");
    setVideoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    // focus back to input for quick sending
    inputRef.current?.focus();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeVideo = () => {
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  return (
    <div className="wa-header border-t border-slate-800 flex-shrink-0">
      {imagePreview && (
        <div className="px-4 pt-4">
          <div className="max-w-3xl mx-auto flex items-center">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-contain rounded-lg border border-slate-700"
                style={{ 
                  imageOrientation: 'from-image',
                  transform: 'none'
                }}
                onLoad={(e) => {
                  e.target.style.transform = 'none';
                  e.target.style.imageOrientation = 'from-image';
                }}
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 transition-colors"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {videoPreview && (
        <div className="px-4 pt-4">
          <div className="max-w-3xl mx-auto flex items-center">
            <div className="relative">
              <video
                src={videoPreview}
                className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                controls
              />
              <button
                onClick={removeVideo}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 transition-colors"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {replyToMessage && (
        <div className="max-w-3xl mx-auto px-3 pt-2">
          <div className="flex items-start gap-2 bg-[var(--wa-item)] rounded-md px-3 py-2 border-l-2 border-cyan-400/70">
            <div className="text-[12px] text-[var(--wa-text-dim)] flex-1 truncate">{replyToMessage.text || "Replied message"}</div>
            <button onClick={() => setReplyToMessage(null)} type="button" className="text-[var(--wa-text-dim)]">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-3">
        <div className="max-w-3xl mx-auto flex space-x-2">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
            }}
            ref={inputRef}
            className="flex-1 wa-input border border-slate-800 rounded-full py-3 px-4 text-[var(--wa-text)] placeholder-[var(--wa-text-dim)] focus:outline-none focus:ring-2 focus:ring-cyan-600/50"
            placeholder="Type a message"
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={handleVideoChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-full transition-colors ${imagePreview ? "bg-cyan-900/40 text-cyan-300" : "text-[var(--wa-text-dim)] hover:bg-[var(--wa-item)]"}`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

    <button
      type="button"
      onClick={() => videoInputRef.current?.click()}
      className={`p-3 rounded-full transition-colors ${videoPreview ? "bg-cyan-900/40 text-cyan-300" : "text-[var(--wa-text-dim)] hover:bg-[var(--wa-item)]"}`}
    >
      <Camera className="w-5 h-5" />
    </button>
          
          <button
            type="submit"
            disabled={!text.trim() && !imagePreview && !videoPreview}
            className="p-3 bg-cyan-600 text-white rounded-full font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
