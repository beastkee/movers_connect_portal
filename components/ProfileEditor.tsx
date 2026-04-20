import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  credentials?: string[];
  [key: string]: any;
}

interface ProfileEditorProps {
  userType: "clients" | "movers";
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ userType }) => {
  const [user, setUser] = useState<ReturnType<typeof getAuth>["currentUser"] | null>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(typeof window !== "undefined");
    if (typeof window !== "undefined") {
      const auth = getAuth();
      setUser(auth.currentUser);
    }
  }, []);
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [credentialFiles, setCredentialFiles] = useState<FileList | null>(null);
  const [uploadingCreds, setUploadingCreds] = useState(false);
  // Helper to upload credentials for movers
  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCredentialFiles(e.target.files);
    }
  };

  const handleUploadCredentials = async () => {
    if (!user || !credentialFiles) return;
    setUploadingCreds(true);
    setError(null);
    try {
      const storage = getStorage();
      const uploadedUrls: string[] = [];
      for (let i = 0; i < credentialFiles.length; i++) {
        const file = credentialFiles[i];
        const storageRef = ref(storage, `movers/${user.uid}/credentials/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }
      // Save URLs to Firestore
      const docRef = doc(db, "users", user.uid, "movers", user.uid);
      const newCreds = [...(profile.credentials || []), ...uploadedUrls];
      await setDoc(docRef, { ...profile, credentials: newCreds }, { merge: true });
      setProfile((prev) => ({ ...prev, credentials: newCreds }));
      setSuccess("Credentials uploaded successfully!");
      setCredentialFiles(null);
    } catch (err: any) {
      setError("Failed to upload credentials.");
    } finally {
      setUploadingCreds(false);
    }
  };

  useEffect(() => {
    if (!isClient || !user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "users", user.uid, userType, user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfileData);
        } else {
          setProfile({ email: user.email });
        }
      } catch (err: any) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isClient, user, userType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    let photoURL = profile.photoURL;
    try {
      if (photoFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `${userType}/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      const docRef = doc(db, "users", user.uid, userType, user.uid);
      await setDoc(docRef, { ...profile, photoURL }, { merge: true });
      setSuccess("Profile updated successfully!");
      setProfile((prev) => ({ ...prev, photoURL }));
    } catch (err: any) {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!isClient) return null;
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1024] via-[#111b3d] to-[#090f20] px-5 text-[#e8ecff]">
        <div className="rounded-xl border border-[#ff8f9f]/45 bg-[#0f1834]/85 px-6 py-4 text-[#ffd4db]">
          You must be logged in to edit your profile.
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1024] via-[#111b3d] to-[#090f20] px-5 text-[#d7e0ff]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1024] via-[#111b3d] to-[#090f20] px-5 py-8 text-[#e8ecff]">
      <div className="w-full max-w-md rounded-2xl border border-[#7ba1ff]/30 bg-[#0f1834]/85 p-6 shadow-[0_20px_50px_rgba(3,7,20,0.55)] backdrop-blur-sm">
      <h2 className="mb-4 text-2xl font-black">Edit Profile</h2>
      {error && <div className="mb-2 rounded-lg border border-[#ff8f9f]/45 bg-[#ff8f9f]/15 px-3 py-2 text-[#ffd4db]">{error}</div>}
      {success && <div className="mb-2 rounded-lg border border-[#7de3ba]/45 bg-[#7de3ba]/12 px-3 py-2 text-[#d7ffef]">{success}</div>}
  <form onSubmit={handleSave} className="space-y-4">
        {/* Only show credential upload for movers */}
        {userType === "movers" && (
          <div>
            <label className="block font-medium">Upload Credentials (License, Insurance, etc.)</label>
            <input className="mt-1 block w-full text-sm text-[#b8c4ea]" type="file" multiple onChange={handleCredentialChange} />
            <button
              type="button"
              className="mt-2 rounded-lg bg-[#7ba1ff] px-4 py-1.5 font-semibold text-[#08112b] transition hover:bg-[#9bb7ff]"
              onClick={handleUploadCredentials}
              disabled={uploadingCreds || !credentialFiles}
            >
              {uploadingCreds ? "Uploading..." : "Upload Credentials"}
            </button>
            {profile.credentials && profile.credentials.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold mb-1">Uploaded Documents:</div>
                <ul className="list-disc ml-6">
                  {profile.credentials.map((url, idx) => (
                    <li key={idx}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#9fb8ff] underline">Document {idx + 1}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div>
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={profile.name || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] px-3 py-2 text-[#eef2ff]"
          />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] px-3 py-2 text-[#eef2ff]"
            disabled
          />
        </div>
        <div>
          <label className="block font-medium">Phone</label>
          <input
            type="text"
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] px-3 py-2 text-[#eef2ff]"
          />
        </div>
        <div>
          <label className="block font-medium">Profile Photo</label>
          <input className="mt-1 block w-full text-sm text-[#b8c4ea]" type="file" accept="image/*" onChange={handlePhotoChange} />
          {profile.photoURL && (
            <img src={profile.photoURL} alt="Profile" className="w-24 h-24 rounded-full mt-2" />
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-[#7ba1ff] py-2 font-semibold text-[#08112b] transition hover:bg-[#9bb7ff]"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
      </div>
    </div>
  );
};

export default ProfileEditor;
