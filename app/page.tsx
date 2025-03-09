"use client";
import { useState } from "react";

type QuestionType = "emoji" | "scale" | "text";

interface Question {
  id: string;
  question: string;
  type: QuestionType;
  // Para emojis, se puede usar string[]
  // Para escalas, se puede usar { [key: number]: string }
  options?: string[] | { [key: number]: string };
  min?: number;
  max?: number;
  // Esta propiedad indica si la pregunta tendrá un campo adicional de texto
  allowExtraInfo?: boolean;
}

// Configuración de las preguntas del formulario dinámico
const questions: Question[] = [
  {
    id: "mood",
    question: "¿Cómo te sientes hoy?",
    type: "emoji",
    options: ["😊", "😔", "😠", "😯", "😟"],
  },
  {
    id: "sleep",
    question: "¿Cómo dormiste hoy?",
    type: "scale",
    min: 1,
    max: 3,
    options: { 1: "Mal", 2: "Regular", 3: "Bien" },
    allowExtraInfo: true,
  },
  {
    id: "notes",
    question: "¿Qué fue lo más relevante de tu día?",
    type: "text",
  },
];

// Componente de formulario dinámico
function DynamicForm({ onFinish }: { onFinish: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (value: any) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Si no es la última pregunta, pasamos a la siguiente
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Última pregunta: guardamos los datos y avisamos al componente padre
      localStorage.setItem("dynamicFormData", JSON.stringify(answers));
      console.log("Datos del formulario dinámico:", answers);
      onFinish();
    }
  };

  return (
    <form onSubmit={handleNext} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="font-medium text-gray-900">
          {currentQuestion.question}
        </label>

        {/* Tipo EMOJI */}
        {currentQuestion.type === "emoji" &&
          Array.isArray(currentQuestion.options) && (
            <div className="flex gap-2">
              {currentQuestion.options.map((emoji, index) => (
                <label
                  key={index}
                  className="cursor-pointer flex flex-col items-center"
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={emoji}
                    checked={answers[currentQuestion.id] === emoji}
                    onChange={() => handleAnswer(emoji)}
                    className="hidden"
                  />
                  <span
                    className={`text-2xl p-2 border rounded ${
                      answers[currentQuestion.id] === emoji
                        ? "bg-blue-200"
                        : "bg-gray-100"
                    }`}
                  >
                    {emoji}
                  </span>
                </label>
              ))}
            </div>
          )}

        {/* Tipo SCALE (con inputs de radio) */}
        {currentQuestion.type === "scale" &&
          currentQuestion.min !== undefined &&
          currentQuestion.max !== undefined &&
          currentQuestion.options && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-4">
                {Array.from(
                  { length: currentQuestion.max - currentQuestion.min + 1 },
                  (_, i) => currentQuestion.min! + i
                ).map((num) => {
                  const labelText =
                    typeof currentQuestion.options === "object" &&
                    currentQuestion.options[num]
                      ? `${num} (${currentQuestion.options[num]})`
                      : `${num}`;
                  return (
                    <label
                      key={num}
                      className="flex items-center space-x-2 text-gray-900"
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={num}
                        checked={answers[currentQuestion.id] === num}
                        onChange={() => handleAnswer(num)}
                      />
                      <span>{labelText}</span>
                    </label>
                  );
                })}
              </div>

              {/* Texto adicional (opcional) */}
              {currentQuestion.allowExtraInfo && (
                <div className="mt-2">
                  <label className="block font-medium text-gray-900 mb-1">
                    Información adicional (opcional)
                  </label>
                  <textarea
                    placeholder="Cuéntanos más..."
                    className="border rounded p-2 text-gray-900 w-full"
                    value={answers[`${currentQuestion.id}_extra`] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [`${currentQuestion.id}_extra`]: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          )}

        {/* Tipo TEXT */}
        {currentQuestion.type === "text" && (
          <textarea
            className="border rounded p-2 text-gray-900"
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
        disabled={!answers[currentQuestion.id]}
      >
        {currentQuestionIndex < questions.length - 1 ? "Siguiente" : "Finalizar"}
      </button>
    </form>
  );
}

// Componente principal
export default function Home() {
  const [dayMood, setDayMood] = useState("");
  const [submitted, setSubmitted] = useState(false); // Controla si se respondió la pregunta inicial
  const [finishedForm, setFinishedForm] = useState(false); // Controla si se terminó el formulario dinámico

  // Al enviar la primera pregunta
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { dayMood, timestamp: new Date().toISOString() };
    localStorage.setItem("emotionsData", JSON.stringify(data));
    console.log("Datos iniciales almacenados:", data);
    setSubmitted(true);
  };

  // Callback para cuando el formulario dinámico termina
  const handleFinishForm = () => {
    setFinishedForm(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          App Emociones &amp; Bienestar
        </h1>
      </header>
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow text-gray-900">
        {/* Paso 1: Pregunta inicial */}
        {!submitted && !finishedForm && (
          <>
            <div className="mb-6 text-center">
              <p className="mt-4 text-xl">
                ¡Hola! Qué gusto tenerte aquí hoy. Cuéntame, ¿cómo estuvo tu día?
              </p>
            </div>
            <form onSubmit={handleInitialSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Describe tu día..."
                value={dayMood}
                onChange={(e) => setDayMood(e.target.value)}
                className="border rounded p-2 text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition-colors"
              >
                Guardar y Continuar
              </button>
            </form>
          </>
        )}

        {/* Paso 2: Formulario dinámico (preguntas una a una) */}
        {submitted && !finishedForm && (
          <>
            <div className="mb-6 text-center">
              <p className="mt-4 text-xl">
                Ahora completa las siguientes preguntas:
              </p>
            </div>
            <DynamicForm onFinish={handleFinishForm} />
          </>
        )}

        {/* Pantalla final de agradecimiento */}
        {finishedForm && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¡Gracias por completar el formulario!
            </h2>
            <p className="text-lg">
              Tu información ha sido registrada. ¡Que tengas un excelente día!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
