## ✅ Provider-Based Model Registry & Classification

এই ডকুমেন্টে আমরা সবগুলো প্রোভাইডার ও তাদের মডেলগুলোর তালিকা করছি, এবং ব্যাখ্যা করছি কোন মডেল কী কাজে উপযুক্ত। লক্ষ্য: পরবর্তীতে fallback ও capability-based decision সিস্টেমে কোনো confusion না থাকে।

---

### 🟦 OpenAI (Cloud)

| Model         | Capability              | Fallback Rank | Notes                          |
| ------------- | ----------------------- | ------------- | ------------------------------ |
| gpt-3.5-turbo | Text completion, coding | 3             | ভালো performance, কম খরচ       |
| gpt-4         | Text, logic-heavy tasks | 2             | ধীর কিন্তু গভীর উত্তরের জন্য   |
| gpt-4o        | Text + Vision + Voice   | 1             | Multimodal, প্রাইমারি fallback |

---

### 🟦 TogetherAI (Cloud)

| Model   | Capability             | Fallback Rank | Notes                |
| ------- | ---------------------- | ------------- | -------------------- |
| mistral | Text summary, LLM task | 2             | Speed ভালো           |
| llama-3 | Text + Code            | 3             | Balanced Model       |
| falcon  | General text           | 4             | lightweight fallback |

---

### 🟩 Groq (Cloud - Superfast)

| Model   | Capability       | Fallback Rank | Notes                 |
| ------- | ---------------- | ------------- | --------------------- |
| mixtral | Text generation  | 1             | Fastest + Cheap       |
| llama3  | Coding assistant | 2             | Groq latency = <100ms |

---

### 🟨 Ollama (Local)

| Model     | Capability             | Load Mode | Notes                            |
| --------- | ---------------------- | --------- | -------------------------------- |
| llama3    | Bengali + Logic        | lazy      | Voice compat. average            |
| codellama | Coding, syntax checker | lazy      | Perfect for Laravel/CLI tasks    |
| mistral   | General LLM            | lazy      | Default fallback if online fails |

---

### 🟫 LMStudio (Local GUI)

| Model    | Capability     | Load Mode | Notes                      |
| -------- | -------------- | --------- | -------------------------- |
| any GGUF | Any, if loaded | manual    | Desktop UI based, optional |

---

### 🟪 Neural Chat / OpenChat (Offline Voice+Instruction)

| Model       | Capability             | Load Mode | Notes                                  |
| ----------- | ---------------------- | --------- | -------------------------------------- |
| neural-chat | Bengali voice fallback | lazy      | বাংলা TTS/STT fallback, instruct ready |
| openchat    | Instruction fallback   | lazy      | Text-first, Bengali support            |

## 🎯 Capability-based Category:

| Category           | Recommended Models                            | Remarks                               |
| ------------------ | --------------------------------------------- | ------------------------------------- |
| 🔊 Voice Output    | gpt-4o, llama3, mistral (Ollama), neural-chat | বাংলা উচ্চারণের উপর ভিত্তি করে tuned  |
| 👁️ Image→HTML     | gpt-4o, mixtral                               | OCR/HTML conversion-ready             |
| 🇧🇩 Bengali Focus | llama3, gpt-4o, codellama, neural-chat        | Mistake-tolerant, fallback strong     |
| 🧠 Code Gen        | codellama, gpt-4, llama3 (Groq)               | Smart correction + CLI use compatible |

---

## 🧠 Smart CLI Suggestion Logic (Planned)

* CLI ইনপুটে যদি ভুল বানান বা অর্ধেক কমান্ডও আসে, system আগে cache > fallback logic ব্যবহার করবে
* Fallback-এর আগে `token normalize`, `intent guess`, `context compare` রানে যাবে
* বানান ভুল detect হলে codellama > llama3 > gpt fallback গঠিত হবে

---

## ✅ YAML Cache Strategy:

* Per-token response store
* Cache query → যদি মিলে, মডেল invoke হবে না
* Fallback → Only if cache miss

---

## 🔁 পেন্ডিং কাজ:

* ✅ এই ডকুমেন্ট অনুযায়ী YAML ফাইল তৈরি (automate)
* ⏳ DB-তে YAML sync logic লেখা
* ⏳ Voice performance observer যুক্ত করা (mismatch হলে alert)
* ⏳ CLI smart suggest logic যুক্ত করা

---

বন্ধু, এখন Task 2 শুরু হচ্ছে: YAML > DB > UI mapping শুরু করছি।
পরবর্তী আপডেটের জন্য তৈরি থাকো — ইনশাল্লাহ কাজগুলো এখন থেকে একটার পর একটা আগাবে!
