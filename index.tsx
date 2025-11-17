// Fix: import `h` from preact to be used with htm
import { render, h } from "preact";
import { useState } from "preact/hooks";
import htm from "htm";
import { GoogleGenAI } from "@google/genai";

// Fix: bind htm to preact's h function
const html = htm.bind(h);

const App = () => {
  // State management
  const [question, setQuestion] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // State for controlling the view ('welcome' or 'form')
  const [view, setView] = useState("welcome");

  /**
   * Calls the Gemini API to get a fortune prediction.
   * This function handles loading states, errors, and processes the AI response.
   * @param {string} question - The user's question for the fortune teller.
   */
  const getFortune = async () => {
    if (!birthDate) {
      setError("โปรดระบุวันเดือนปีเกิดของท่าน");
      return;
    }
    if (!question.trim()) {
      setError("โปรดป้อนคำถามของท่าน");
      return;
    }
    setLoading(true);
    setError("");
    setPrediction("");

    const systemInstruction = `คุณเป็นหมอดูสไตล์ลึกลับ ให้คำทำนายโดยอ้างอิงจากวันเดือนปีเกิดและคำถามที่ได้รับมาอย่างแม่นยำและมีความหมายลึกซึ้ง ใช้โทนคำพูดอบอุ่น อธิบายเหมือนอ่านไพ่ให้ลูกค้า กรุณาตอบในรูปแบบต่อไปนี้เสมอ:
      🔮 ไพ่ที่สื่อถึงสถานการณ์ตอนนี้
      (อธิบาย 2–4 บรรทัด)

      💫 คำทำนาย
      (อธิบาย 3–6 บรรทัด)

      🌟 คำแนะนำ
      (เป็น bullet 2–4 ข้อ)

      📌 สรุปภาพรวมดวง
      (1–2 บรรทัด)`;

    const contents = `วันเดือนปีเกิดของข้าพเจ้าคือ: ${birthDate}\nคำถามของข้าพเจ้าคือ: "${question}"`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        }
      });
      setPrediction(response.text);
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setError("เกิดข้อผิดพลาดในการทำนาย โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // Resets the state to allow for a new prediction
  const handleReset = () => {
    setQuestion("");
    setBirthDate("");
    setPrediction("");
    setError("");
    const textarea = document.querySelector('textarea');
    if (textarea) {
        textarea.focus();
    }
  };

  /**
   * Renders the prediction text with special formatting for titles and lists.
   * @param {string} text - The prediction text from the API.
   */
  const renderFormattedPrediction = (text) => {
    if (!text) return null;

    const parts = text.split(/(?=🔮|💫|🌟|📌)/).filter(part => part.trim() !== '');

    return parts.map((part, index) => {
      const lines = part.trim().split('\n');
      const title = lines[0];
      const content = lines.slice(1).join('\n').trim();

      if (title.includes('🌟')) {
        const adviceItems = content.split('\n').map(item => item.trim().replace(/^[-*]\s*/, ''));
        return html`
          <div key=${index} class="prediction-section">
            <h3 class="prediction-title">${title}</h3>
            <ul class="advice-list">
              ${adviceItems.filter(item => item).map(item => html`<li>${item}</li>`)}
            </ul>
          </div>
        `;
      }

      return html`
        <div key=${index} class="prediction-section">
          <h3 class="prediction-title">${title}</h3>
          <p class="prediction-content">${content}</p>
        </div>
      `;
    });
  };


  return html`
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Maitree:wght@300;400;600&display=swap');
      
      :root {
        --bg-color: #0d0a1a;
        --primary-color: #a482ff;
        --secondary-color: #e0d8ff;
        --card-bg: #1a162d;
        --border-color: #4a3f6d;
        --glow-color: rgba(164, 130, 255, 0.5);
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: 'Maitree', serif;
        background-color: var(--bg-color);
        color: var(--secondary-color);
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        padding: 2rem;
        background-image: radial-gradient(circle at 50% 50%, rgba(26, 22, 45, 0.9) 0%, var(--bg-color) 70%);
      }

      .container {
        width: 100%;
        max-width: 600px;
        padding: 2rem;
        text-align: center;
      }

      h1 {
        font-size: 2.5rem;
        font-weight: 600;
        color: var(--primary-color);
        text-shadow: 0 0 10px var(--glow-color), 0 0 20px var(--glow-color);
        margin-bottom: 1rem;
        animation: pulse 4s infinite ease-in-out;
      }
      
      .subtitle {
        font-size: 1.1rem;
        font-weight: 300;
        margin-bottom: 2rem;
        opacity: 0.8;
      }

      .input-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-bottom: 2rem;
        width: 100%;
      }
      
      .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-align: left;
      }

      label {
        font-size: 0.9rem;
        opacity: 0.8;
        padding-left: 0.5rem;
      }

      input[type="date"] {
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.9rem;
        color: var(--secondary-color);
        font-family: 'Maitree', serif;
        font-size: 1rem;
        transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
        width: 100%;
      }
      
      input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
      }

      input[type="date"]:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 10px var(--glow-color);
      }
      
      input[type="date"]:disabled {
        background-color: #2c2844;
        cursor: not-allowed;
      }

      textarea {
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        color: var(--secondary-color);
        font-family: 'Maitree', serif;
        font-size: 1rem;
        min-height: 100px;
        resize: vertical;
        transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
      }

      textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 10px var(--glow-color);
      }
      
      textarea:disabled {
        background-color: #2c2844;
        cursor: not-allowed;
      }

      .btn {
        background: linear-gradient(90deg, #8e44ad, #a482ff);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.8rem 1.5rem;
        font-family: 'Maitree', serif;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.3s, background-color 0.3s, color 0.3s, border-color 0.3s;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        width: 100%;
      }

      .btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 0 20px var(--glow-color);
      }

      .btn:disabled {
        background: var(--border-color);
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      .start-button {
        padding: 1rem 1.5rem;
        font-size: 1.3rem;
        animation: fadeIn 0.8s ease-out;
      }
      
      .button-group {
        display: flex;
        gap: 1rem;
      }

      .btn-secondary {
        background: transparent;
        border: 2px solid var(--border-color);
        color: var(--secondary-color);
      }
      
      .btn-secondary:hover:not(:disabled) {
        background-color: var(--card-bg);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
      
      .reset-button {
        margin-top: 1.5rem;
      }

      .loader {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
      }
      
      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse {
        0% { text-shadow: 0 0 10px var(--glow-color), 0 0 20px var(--glow-color); }
        50% { text-shadow: 0 0 20px var(--glow-color), 0 0 35px var(--glow-color); }
        100% { text-shadow: 0 0 10px var(--glow-color), 0 0 20px var(--glow-color); }
      }

      .result-card {
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 2rem;
        margin-top: 2rem;
        text-align: left;
        line-height: 1.8;
        animation: fadeIn 0.5s ease-in-out;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .prediction-section {
        opacity: 0.9;
      }

      .prediction-title {
        color: var(--primary-color);
        font-size: 1.3rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 0.75rem;
      }

      .prediction-content {
        margin: 0;
        padding-left: 0.5rem;
        border-left: 2px solid var(--border-color);
      }
      
      .advice-list {
        list-style: none;
        padding-left: 0.5rem;
        margin: 0;
        border-left: 2px solid var(--border-color);
      }

      .advice-list li {
        padding-left: 1.2rem;
        position: relative;
      }

      .advice-list li:not(:last-child) {
          margin-bottom: 0.5rem;
      }

      .advice-list li::before {
        content: '✨';
        position: absolute;
        left: -8px;
        top: 2px;
        color: var(--primary-color);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .error-message {
        color: #ff6b6b;
        margin-top: 1rem;
      }
      
      .form-view {
         animation: fadeIn 0.8s ease-out;
         width: 100%;
         display: flex;
         flex-direction: column;
         align-items: center;
      }
    </style>
    <div class="container">
      <h1>🔮 เปิดไพ่ ทำนายดวงชะตา 🔮</h1>
      <p class="subtitle">จงตั้งจิตอธิษฐาน แล้วพิมพ์คำถามที่ท่านปรารถนาจะรู้</p>
      
      ${view === 'welcome' && html`
        <button class="btn start-button" onClick=${() => setView('form')}>
          เริ่มทำนาย
        </button>
      `}
      
      ${view === 'form' && html`
        <div class="form-view">
            <div class="input-container">
                <div class="input-group">
                    <label for="birthdate">วันเดือนปีเกิด</label>
                    <input 
                        type="date" 
                        id="birthdate"
                        value=${birthDate}
                        onInput=${(e) => setBirthDate(e.currentTarget.value)}
                        disabled=${loading}
                        aria-label="Birthdate Input"
                    />
                </div>
                 <div class="input-group">
                    <label for="question">คำถามที่ต้องการทราบ</label>
                    <textarea
                        id="question"
                        placeholder="เช่น การงาน, ความรัก, การเงิน..."
                        value=${question}
                        onInput=${(e) => setQuestion(e.currentTarget.value)}
                        aria-label="Question Input"
                        disabled=${loading}
                    ></textarea>
                </div>
                <div class="button-group">
                    <button type="button" class="btn btn-secondary" onClick=${handleReset} disabled=${loading}>รีเซ็ต</button>
                    <button class="btn" onClick=${getFortune} disabled=${loading}>
                        ${loading ? "กำลังอ่านชะตา..." : "ทำนาย"}
                    </button>
                </div>
            </div>

            ${error && html`<p class="error-message">${error}</p>`}
            
            ${loading && html`
                <div class="loader">
                <div class="spinner"></div>
                <p>กงล้อแห่งโชคชะตากำลังหมุน...</p>
                </div>
            `}
            
            ${prediction && html`
                <div class="result-card" aria-live="polite">
                ${renderFormattedPrediction(prediction)}
                </div>
                <button class="btn btn-secondary reset-button" onClick=${handleReset}>
                    ทำนายอีกครั้ง
                </button>
            `}
        </div>
      `}
    </div>
  `;
};

render(html`<${App} />`, document.getElementById("root"));