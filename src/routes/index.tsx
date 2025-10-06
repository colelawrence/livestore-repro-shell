import { LiveStoreProvider, useStore, useQuery } from "@livestore/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";
import { liveStoreAdapter } from "#src/livestore/adapter.ts";
import { allSessionsQuery } from "#src/livestore/queries.ts";
import type { SessionID } from "#src/livestore/schema.ts";
import { events, schema } from "#src/livestore/schema.ts";
import { queryDb } from "@livestore/livestore";

function ShellContent() {
  const { store: liveStore } = useStore();
  const [sessionName, setSessionName] = useState("");

  // Subscribe to all sessions using query
  const sessions = useQuery(queryDb(allSessionsQuery())) ?? [];

  const addSession = () => {
    if (!sessionName.trim()) return;

    liveStore.commit(
      events.AddSession({
        id: `session-${Date.now()}` as SessionID,
        name: sessionName,
        createdAt: Date.now(),
      }),
    );

    setSessionName("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome to Shell</h2>
      <p>LiveStore is ready</p>

      <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
        <h3>Sessions ({sessions.length})</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Session name"
            style={{ padding: "8px", flex: 1, borderRadius: "4px", border: "1px solid #ccc" }}
            onKeyDown={(e) => e.key === "Enter" && addSession()}
          />
          <button
            onClick={addSession}
            style={{
              padding: "8px 16px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Session
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {sessions.map((session) => (
            <li
              key={session.id}
              style={{
                padding: "8px",
                background: "#f3f4f6",
                marginBottom: "4px",
                borderRadius: "4px",
              }}
            >
              {session.name} <span style={{ color: "#666", fontSize: "12px" }}>({session.id})</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => {
            window.open(
              `/_livestore/web/${liveStore.storeId}/${liveStore.clientId}/${liveStore.sessionId}/default`,
              "_blank",
            );
          }}
          style={{
            padding: "8px 16px",
            background: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Open LiveStore DevTools
        </button>

        <button
          onClick={() => {
            const snapshot = liveStore.reactivityGraph.getSnapshot({ includeResults: true });
            console.log("LiveStore Snapshot:", snapshot);
          }}
          style={{
            padding: "8px 16px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Log Snapshot to Console
        </button>
      </div>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <div>Store ID: {liveStore.storeId}</div>
        <div>Client ID: {liveStore.clientId}</div>
        <div>Session ID: {liveStore.sessionId}</div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <LiveStoreProvider
      schema={schema}
      adapter={liveStoreAdapter}
      storeId="shell-store"
      batchUpdates={batchUpdates}
      renderLoading={() => <div>Loading LiveStore...</div>}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ShellContent />
      </Suspense>
    </LiveStoreProvider>
  );
}

export const Route = createFileRoute("/")({
  component: Home,
});
