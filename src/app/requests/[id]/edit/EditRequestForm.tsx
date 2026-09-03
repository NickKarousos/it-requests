"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import { Request as PrismaRequest } from "@prisma/client";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditRequestForm({ 
  requestData, 
  isAdmin, 
  users = [] 
}: { 
  requestData: PrismaRequest, 
  isAdmin?: boolean, 
  users?: { id: string, name: string | null, email: string | null }[] 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: requestData.title,
    description: requestData.description,
    category: requestData.category,
    priority: requestData.priority,
    attachmentUrl: requestData.attachmentUrl,
    requiredByDate: requestData.requiredByDate ? new Date(requestData.requiredByDate).toISOString().split('T')[0] : "",
    userId: requestData.userId,
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) setFile(blob);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let updatedAttachmentUrl = formData.attachmentUrl;

    if (removeAttachment) {
      updatedAttachmentUrl = null;
    } else if (file) {
      setFileUploading(true);
      const fileFormData = new FormData();
      fileFormData.append("file", file);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fileFormData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          updatedAttachmentUrl = uploadData.url;
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
      setFileUploading(false);
    }

    try {
      const payload = { ...formData, attachmentUrl: updatedAttachmentUrl };
      const res = await fetch(`/api/requests/${requestData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/requests/${requestData.id}`);
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label className="input-label">Σύντομος Τίτλος / Θέμα</label>
        <input
          type="text"
          required
          className="input-field"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
        />
      </div>

      {isAdmin && (
        <div className="input-group">
          <label className="input-label">Εκ μέρους (User)</label>
          <select 
            className="input-field"
            value={formData.userId}
            onChange={e => setFormData({...formData, userId: e.target.value})}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      )}

      <div className="input-group">
        <label className="input-label">Αναλυτική Περιγραφή</label>
        <div style={{ background: "white", color: "black", borderRadius: "8px", overflow: "hidden" }}>
          <ReactQuill 
            theme="snow" 
            value={formData.description} 
            onChange={(val) => setFormData({...formData, description: val})} 
          />
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label">Ανέβασμα Αρχείου / Screenshot</label>
        {formData.attachmentUrl && !removeAttachment && (
          <div style={{ marginBottom: "0.5rem", padding: "0.5rem", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)" }}>Υπάρχει Επισυναπτόμενο Αρχείο</span>
            <button type="button" className="btn-secondary" onClick={() => setRemoveAttachment(true)} style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem", color: "var(--danger)", borderColor: "rgba(239,68,68,0.3)" }}>
              Διαγραφή
            </button>
          </div>
        )}
        {(removeAttachment || !formData.attachmentUrl) && (
          <>
            <input type="file" className="input-field" onChange={e => e.target.files && setFile(e.target.files[0])} accept="image/*,.pdf,.doc,.docx" style={{ padding: "0.5rem" }} />
            {file && <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", marginTop: "0.5rem", display: "block" }}>Νέο αρχείο: {file.name}</span>}
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", alignItems: "end" }}>
        <div className="input-group">
          <label className="input-label">Κατηγορία</label>
          <select 
            className="input-field"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
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
          <label className="input-label">Προτεραιότητα</label>
          <select 
            className="input-field"
            value={formData.priority}
            onChange={e => setFormData({...formData, priority: e.target.value})}
          >
            <option value="Low">Χαμηλή (Όταν υπάρχει χρόνος)</option>
            <option value="Medium">Μεσαία (Κανονική)</option>
            <option value="High">Υψηλή (Σημαντικό)</option>
            <option value="Urgent">Επείγουσα (Άμεσα)</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Επιθυμητή Ημερομηνία (Προαιρετικό)</label>
          <input
            type="date"
            className="input-field"
            value={formData.requiredByDate}
            onChange={e => setFormData({...formData, requiredByDate: e.target.value})}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button type="submit" disabled={loading || fileUploading} className="btn-primary">
          {loading || fileUploading ? "Αποθήκευση..." : "Αποθήκευση Αλλαγών"}
        </button>
      </div>
    </form>
  );
}
