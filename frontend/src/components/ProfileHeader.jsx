import { useState, useRef, useEffect } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { toast } from "react-hot-toast";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  // Clear selectedImg when authUser changes (e.g., on login/logout)
  // But only if the user actually changed, not just on profile updates
  useEffect(() => {
    if (authUser?._id) {
      setSelectedImg(null);
    }
  }, [authUser?._id]);


  // Show loading state if authUser is not loaded yet
  if (!authUser) {
    return (
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-slate-700 rounded-full animate-pulse" />
          <div>
            <div className="w-24 h-4 bg-slate-700 rounded animate-pulse mb-2" />
            <div className="w-16 h-3 bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const compressImage = (file, maxWidth = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedImage = await compressImage(file);
      setSelectedImg(compressedImage);
      await updateProfile({ profilePic: compressedImage });
      // Clear selectedImg after successful upload so it shows the Cloudinary URL
      setSelectedImg(null);
    } catch (error) {
      console.error("Image compression failed:", error);
      toast.error("Failed to process image");
    }
  };

  return (
    <div className="px-3 py-2 wa-header border-b border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar avatar-online">
            <button
              className="w-14 h-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-[15px] text-[var(--wa-text)] font-medium max-w-[180px] truncate">
              {authUser.fullName}
            </h3>

            <p className="text-[11px] text-[var(--wa-text-dim)]">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 items-center">
          {/* LOGOUT BTN */}
          <button
            className="text-[var(--wa-text-dim)] hover:text-[var(--wa-text)] transition-colors"
            onClick={handleLogout}
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-[var(--wa-text-dim)] hover:text-[var(--wa-text)] transition-colors"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
