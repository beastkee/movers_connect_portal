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
  if (!user) return <div className="text-center text-red-500">You must be logged in to edit your profile.</div>;
  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}
  <form onSubmit={handleSave} className="space-y-4">
        {/* Only show credential upload for movers */}
        {userType === "movers" && (
          <div>
            <label className="block font-medium">Upload Credentials (License, Insurance, etc.)</label>
            <input type="file" multiple onChange={handleCredentialChange} />
            <button
              type="button"
              className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
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
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Document {idx + 1}</a>
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
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
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
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Profile Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {profile.photoURL && (
            <img src={profile.photoURL} alt="Profile" className="w-24 h-24 rounded-full mt-2" />
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfileEditor;
