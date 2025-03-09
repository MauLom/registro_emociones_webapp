"use client";
import { useState } from "react";

type QuestionType = "emoji" | "scale" | "text";

interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[] | { [key: number]: string };
  min?: number;
  max?: number;
}

// Configuración de las preguntas
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
  },
  {
    id: "notes",
    question: "¿Qué fue lo más relevante de tu día?",
    type: "text",
  },
];

export default function DynamicForm() {
  // Estado para almacenar las respuestas de cada pregunta
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  // Función para actualizar la respuesta de cada pregunta
  const handleChange = (id: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  // Al enviar el formulario, guardamos la data en local storage y la mostramos en la consola
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("dynamicFormData", JSON.stringify(answers));
    console.log("Datos del formulario:", answers);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Formulario Dinámico</h1>
      </header>
      <main className="w-full max-w-md bg-white p-6 rounded shadow">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {questions.map((q) => (
            <div key={q.id} className="flex flex-col gap-2">
              <label className="font-medium">{q.question}</label>
              {q.type === "emoji" && Array.isArray(q.options) && (
                <div className="flex gap-2">
                  {q.options.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`text-2xl p-2 border rounded ${
                        answers[q.id] === emoji
                          ? "bg-blue-200"
                          : "bg-gray-100"
                      }`}
                      onClick={() => handleChange(q.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              {q.type === "scale" &&
                q.min !== undefined &&
                q.max !== undefined &&
                q.options && (
                  <div className="flex gap-4">
                    {Array.from(
                      { length: q.max - q.min + 1 },
                      (_, i) => q.min! + i
                    ).map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`p-2 border rounded ${
                          answers[q.id] === num
                            ? "bg-blue-200"
                            : "bg-gray-100"
                        }`}
                        onClick={() => handleChange(q.id, num)}
                      >
                        {num}{" "}
                        {typeof q.options === "object" &&
                          q.options[num] &&
                          `(${q.options[num]})`}
                      </button>
                    ))}
                  </div>
                )}
              {q.type === "text" && (
                <textarea
                  className="border rounded p-2"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition-colors"
          >
            Guardar Formulario
          </button>
        </form>
      </main>
    </div>
  );
}
