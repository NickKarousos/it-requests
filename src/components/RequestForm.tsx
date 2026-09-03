"use client";

import { useState, useEffect } from "react";
import styles from "./RequestForm.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function RequestForm({ onCreated }: { onCreated?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setUsers(data);
        })
        .catch(err => console.error("Failed to fetch users", err));
    }
  }, [session]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setFile(blob);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) {
      alert("You must be logged in to submit a request.");
      return;
    }
    
    setLoading(true);
    
    // Capture form data synchronously before any awaits
    const formData = new FormData(e.currentTarget);
    const formElement = e.target as HTMLFormElement;

    let attachmentUrl = null;

    if (file) {
      setFileUploading(true);
      const fileFormData = new FormData();
      fileFormData.append("file", file);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileFormData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
        } else {
          console.error("Failed to upload file");
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
      setFileUploading(false);
    }
    
    const data = {
      title: formData.get("title"),
      description: description,
      category: formData.get("category"),
      priority: formData.get("priority"),
      attachmentUrl,
      requiredByDate: formData.get("requiredByDate") ? new Date(formData.get("requiredByDate") as string).toISOString() : null,
      requestedForUserId: formData.get("requestedForUserId"),
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
        formElement.reset();
        setDescription("");
        setFile(null);
        if (onCreated) onCreated();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  if (!session) {
    return (
      <div className="glass-card" style={{ textAlign: "center", margin: "2rem auto", maxWidth: "600px" }}>
        <h2>Please log in to submit a request.</h2>
        <button onClick={() => router.push("/login")} className="btn-primary" style={{ marginTop: "1rem" }}>
          Log In
        </button>
      </div>
    );
  }

  return (
    <form className={`glass-card ${styles.form}`} onSubmit={handleSubmit} style={{ margin: "2rem auto", maxWidth: "800px" }}>
      <h2 className={styles.formTitle}>Υποβολή Αιτήματος</h2>
      
      {success && (
        <div className={styles.successMessage}>
          Το αίτημα υποβλήθηκε με επιτυχία! Η ομάδα IT ενημερώθηκε.
        </div>
      )}

      <div className="input-group">
        <label className="input-label" htmlFor="title">Σύντομος Τίτλος / Θέμα</label>
        <input required type="text" id="title" name="title" className="input-field" placeholder="π.χ. Δεν λειτουργεί ο εκτυπωτής στον 2ο όροφο" />
      </div>

      {session?.user?.role === "ADMIN" && (
        <div className="input-group">
          <label className="input-label" htmlFor="requestedForUserId">Εκ μέρους (User)</label>
          <select id="requestedForUserId" name="requestedForUserId" className="input-field">
            <option value="">-- Ανάθεση σε εμένα --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      )}

      <div className="input-group">
        <label className="input-label" htmlFor="description">Αναλυτική Περιγραφή</label>
        <div style={{ background: "white", color: "black", borderRadius: "8px", overflow: "hidden" }}>
          <ReactQuill theme="snow" value={description} onChange={setDescription} />
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label" htmlFor="file">Ανέβασμα Αρχείου / Screenshot (Επιλέξτε ή πατήστε Ctrl+V για επικόλληση)</label>
        <input type="file" id="file" name="file" className="input-field" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" style={{ padding: "0.5rem" }} />
        {file && <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", marginTop: "0.5rem", display: "block" }}>Επισυνάφθηκε: {file.name}</span>}
      </div>

      <div className={styles.grid3}>
        <div className="input-group">
          <label className="input-label" htmlFor="category">Κατηγορία</label>
          <select required id="category" name="category" className="input-field">
            <option value="General">Γενικά (General)</option>
            <option value="Bugs">Σφάλματα (Bugs)</option>
            <option value="New Feature">Νέα Δυνατότητα (New Feature)</option>
            <option value="Faulty Hardware">Προβληματικός Εξοπλισμός (Faulty Hardware)</option>
            <option value="New Hardware">Νέος Εξοπλισμός (New Hardware)</option>
            <option value="New Software">Νέο Λογισμικό (New Software)</option>
            <option value="Zoho CRM">Zoho CRM</option>
            <option value="Zoho Workdrive">Zoho Workdrive</option>
            <option value="Zoho Flow">Zoho Flow</option>
            <option value="Automations">Αυτοματισμοί (Automations)</option>
            <option value="AI">Τεχνητή Νοημοσύνη (AI)</option>
            <option value="Credentials">Κωδικοί / Πρόσβαση (Credentials)</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="priority">Προτεραιότητα</label>
          <select required id="priority" name="priority" className="input-field" defaultValue="Medium">
            <option value="Low">Χαμηλή (Όταν υπάρχει χρόνος)</option>
            <option value="Medium">Μεσαία (Κανονική)</option>
            <option value="High">Υψηλή (Σημαντικό)</option>
            <option value="Urgent">Επείγουσα (Άμεσα)</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="requiredByDate">Επιθυμητή Ημερομηνία (Προαιρετικό)</label>
          <input type="date" id="requiredByDate" name="requiredByDate" className="input-field" />
        </div>
      </div>

      <div className={styles.actions} style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
        <button type="submit" className="btn-primary" disabled={loading || fileUploading} style={{ minWidth: "200px" }}>
          {loading || fileUploading ? <><span className="spinner"></span> Υποβολή...</> : "Υποβολή Αιτήματος"}
        </button>
      </div>
    </form>
  );
}
