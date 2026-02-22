# Vapi setup: why admission flow works (or doesn’t)

## Why the AI was giving OJEE/website instead of asking questions

Calls can use either:

1. **A fixed Assistant** (by ID), or  
2. **A Server URL** that returns the assistant on each call.

If your **phone number** (or “Inbound” config) is set to use an **Assistant ID**, Vapi does **not** call your backend for `assistant-request`. It uses the assistant stored in the dashboard (the one you get when you click “Sync Now”). That assistant has a long system prompt; the model was following the “provide phone and website for admissions” part and ignoring the “ask name, age, area, course” part.

So the admission flow was not running because **the call was not using the webhook** — it was using the synced assistant only.

---

## Fix: use the webhook for every call

To get the **dynamic prompt** and **admission tool** (so the AI asks name → age → area → course):

1. In **Vapi Dashboard** go to **Phone Numbers** (or wherever your inbound number is configured).
2. Set **Server URL** to your webhook, for example:
   - Local: `https://your-ngrok-url.ngrok.io/api/webhook/vapi`
   - Production: `https://your-app.vercel.app/api/webhook/vapi`
3. **Do not select an Assistant** for this number (leave Assistant blank / “Use server” if there is such an option).

Then, on every inbound call, Vapi will send `assistant-request` to your Server URL. Your backend returns the assistant (with the admission flow and the `getAdmissionQuestion` tool). The AI will:

- Call the tool when the user says “admission” / “assist me on admission”, etc.
- Say exactly what the tool returns (e.g. “May I know your full name?”), then ask age, area, course in order.

---

## What the webhook does

- **`assistant-request`**  
  Your backend returns the full assistant config, including:
  - System prompt with “when they say admission, use the tool”
  - Tool: `getAdmissionQuestion(step: 1..5)` so the script is controlled by your server.

- **`tool-calls`**  
  When the model calls `getAdmissionQuestion(step)`, Vapi POSTs to the same Server URL. Your backend replies with the exact phrase for that step (e.g. step 1 = “May I know your full name?”). The AI speaks that and continues the flow.

- **`end-of-call-report`**  
  Your backend logs the call and can send SMS, etc.

So the **same Server URL** must be the one used for the **phone number** (so that both `assistant-request` and `tool-calls` hit your backend).

---

## If you see “assistant-request-returned-invalid-assistant”

Some Vapi accounts are strict about what can be returned in `assistant-request`. If you get this error after we added the tool:

1. We can temporarily remove the **tool** from the webhook response and rely only on the **prompt** (admission block at the top). You’d still need the phone number to use the **Server URL** (no Assistant ID) so that the dynamic prompt is used.
2. Or you can add the **Custom Tool** yourself in the Vapi Dashboard (function `getAdmissionQuestion`, parameter `step`), set its **Server URL** to the same webhook, and keep the prompt that says “when they say admission, call getAdmissionQuestion(step: 1) and say the returned messageToSay”.

---

## Summary

| Goal                         | What to do |
|-----------------------------|------------|
| Admission flow (ask name, age, area, course) | Use **Server URL** on the **phone number**; **do not** set an Assistant ID for that number. |
| Static assistant (no webhook) | Use **Assistant ID** on the phone number; “Sync Now” only updates that assistant’s prompt; **assistant-request is never sent**. |

So: **set the phone number’s Server URL to your webhook and leave Assistant unset** — then the admission flow and tool will work.
