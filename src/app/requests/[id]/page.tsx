import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatusSelect from "@/components/StatusSelect";
import TimerButton from "@/components/TimerButton";
import "react-quill-new/dist/quill.snow.css";

export const dynamic = 'force-dynamic';

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const { id: paramId } = await params;
  const id = parseInt(paramId);
  const reqRecord = await prisma.request.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!reqRecord) {
    return (
      <main className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
        <h2>Request Not Found</h2>
        <Link href="/" className="btn-secondary" style={{ marginTop: "1rem" }}>Back to Home</Link>
      </main>
    );
  }

  const isOwner = reqRecord.userId.toString() === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return (
      <main className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
        <h2>Forbidden: You do not have permission to view this request.</h2>
        <Link href="/" className="btn-secondary" style={{ marginTop: "1rem" }}>Back to Home</Link>
      </main>
    );
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent": return "badge urgent";
      case "High": return "badge high";
      case "Medium": return "badge medium";
      case "Low": return "badge low";
      default: return "badge";
    }
  };

  return (
    <main className="container">
      <header className="page-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ROBBIE Logo" style={{ height: "90px" }} />
          <div>
            <h1 className="page-title" style={{ marginBottom: "0.25rem", fontSize: "2rem" }}>Request #{reqRecord.id}</h1>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          {isOwner && (
            <Link href={`/requests/${reqRecord.id}/edit`} className="btn-secondary" style={{ display: "flex", alignItems: "center" }}>
              Edit Request
            </Link>
          )}
          <Link href={isAdmin ? "/admin" : "/"} className="btn-secondary" style={{ display: "flex", alignItems: "center" }}>
            Back
          </Link>
        </div>
      </header>

      <section className="glass-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{reqRecord.title}</h2>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Submitted by <strong>{reqRecord.user.name}</strong> ({reqRecord.user.email}) on {new Date(reqRecord.createdAt).toLocaleDateString()}
            </div>
          </div>
          <span className={getPriorityBadgeClass(reqRecord.priority)} style={{ fontSize: "1rem", padding: "0.4rem 1rem" }}>
            {reqRecord.priority}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem", padding: "1rem", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
          <div>
            <strong style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Category</strong>
            {reqRecord.category}
          </div>
          <div>
            <strong style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Required By Date</strong>
            {reqRecord.requiredByDate ? new Date(reqRecord.requiredByDate).toLocaleDateString() : "Not specified"}
          </div>
          <div>
            <strong style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Status</strong>
            {isAdmin ? (
              <StatusSelect id={reqRecord.id} currentStatus={reqRecord.status} />
            ) : (
              <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>{reqRecord.status}</span>
            )}
          </div>
          {isAdmin && (
            <div>
              <strong style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Time Tracked</strong>
              <TimerButton id={reqRecord.id} isRunning={!!reqRecord.timerStartedAt} timeSpent={reqRecord.timeSpent} timerStartedAt={reqRecord.timerStartedAt?.toISOString()} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <strong style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Detailed Description</strong>
          <div className="ql-snow" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
            <div className="ql-editor" style={{ padding: "1.5rem" }} dangerouslySetInnerHTML={{ __html: reqRecord.description }} />
          </div>
        </div>

        {reqRecord.attachmentUrl && (
          <div>
            <strong style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Attachment</strong>
            {reqRecord.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
              <a href={reqRecord.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reqRecord.attachmentUrl} alt="Attachment" style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
              </a>
            ) : (
              <a href={reqRecord.attachmentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Download / View Attachment
              </a>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
