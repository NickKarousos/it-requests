## Plesk Thread Exhaustion Handling
Whenever working on the Plesk shared hosting environment, running heavy commands like Next.js builds may cause the server to throw an `OS can't spawn worker thread: Resource temporarily unavailable (os error 11)` error. This occurs because the server runs out of background threads. 

**Agent Action:**
Do NOT attempt to fix this via terminal commands or code changes. Immediately instruct the user to:
1. Open their Plesk Node.js dashboard.
2. Click the **'Disable Node.js'** button to forcefully kill the frozen background processes.
3. Wait 5 seconds.
4. Click **'Enable Node.js'**.
5. Re-run the command.
