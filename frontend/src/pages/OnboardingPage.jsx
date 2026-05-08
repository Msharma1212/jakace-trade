import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, CameraIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setFormState((prev) => ({
      ...prev,
      profilePic: reader.result, // ✅ yahi main fix hai
    }));
  };

  reader.readAsDataURL(file);

  toast.success("Image selected!");
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-black flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-3xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
        <div className="card-body p-6 sm:p-8">

          {/* TITLE */}
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* PROFILE PIC */}
            <div className="flex flex-col items-center space-y-4">

              <div className="size-32 rounded-full bg-white/10 overflow-hidden border border-white/20 shadow-lg">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-white/40" />
                  </div>
                )}
              </div>

              {/* UPLOAD BUTTON */}
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="fileUpload"
                />

                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition shadow-lg text-white"
                >
                  Upload Image
                </label>
              </div>

            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white/80">Full Name</span>
              </label>
              <input
                type="text"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
                className="input w-full bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:border-purple-400 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white/80">Bio</span>
              </label>
              <textarea
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea h-24 w-full bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:border-purple-400 focus:outline-none"
                placeholder="Tell me about yourself & What's your learning goals..."
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <select
                value={formState.nativeLanguage}
                onChange={(e) =>
                  setFormState({ ...formState, nativeLanguage: e.target.value })
                }
                className="select w-full bg-[#1e293b] text-white"
              >
                <option value="">Select native language</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang}>{lang}</option>
                ))}
              </select>

              <select
                value={formState.learningLanguage}
                onChange={(e) =>
                  setFormState({ ...formState, learningLanguage: e.target.value })
                }
                className="select w-full bg-[#1e293b] text-white"
              >
                <option value="">Select learning language</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang}>{lang}</option>
                ))}
              </select>

            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white/80">Location</span>
              </label>

              <div className="relative">
                <MapPinIcon className="absolute top-3 left-3 size-5 text-purple-400" />
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState({ ...formState, location: e.target.value })
                  }
                  className="input w-full pl-10 bg-white/5 border border-white/10 text-white placeholder:text-white/50"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center gap-2 hover:scale-105 transition"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                "Complete Onboarding"
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5" />
                  Loading...
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;