import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, X } from 'lucide-react';
import { api } from '../../services/api.js';

interface QuizAnswer {
  name: string;
  age: string;
  lastVehicle: string;
  interests: string;
  mainUse: string;
}

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: string;
  vehicleTitle?: string;
}

export function QuizForm({ isOpen, onClose, vehicleId, vehicleTitle }: QuizFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer>({
    name: '',
    age: '',
    lastVehicle: '',
    interests: '',
    mainUse: '',
  });

  const questions = [
    {
      id: 'name',
      question: '¿Cómo te llamas?',
      placeholder: 'Tu nombre',
      type: 'text' as const,
    },
    {
      id: 'age',
      question: '¿Cuál es tu edad?',
      placeholder: '25',
      type: 'text' as const,
    },
    {
      id: 'lastVehicle',
      question: '¿Cuál ha sido tu último vehículo?',
      placeholder: 'Ej: BMW Serie 3, Toyota Corolla...',
      type: 'text' as const,
    },
    {
      id: 'interests',
      question: '¿Qué te interesa conocer de este vehículo?',
      placeholder: 'Ej: Rendimiento, consumo, características...',
      type: 'textarea' as const,
    },
    {
      id: 'mainUse',
      question: '¿Cuál será tu uso principal?',
      placeholder: 'Ej: Diario, deportivo, familiar, viajes...',
      type: 'text' as const,
    },
  ];

  const currentQuestion = questions[currentStep];
  const currentValue = answers[currentQuestion.id as keyof QuizAnswer];

  const isValidValue = (value: string, questionId: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    
    // Special validation for age field
    if (questionId === 'age') {
      // Only allow numbers and must have at least 2 digits
      const numericValue = trimmed.replace(/\D/g, '');
      return numericValue.length >= 2;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.submitTestDrive({
        vehicleId,
        vehicleTitle,
        name: answers.name,
        age: answers.age,
        lastVehicle: answers.lastVehicle,
        interests: answers.interests,
        mainUse: answers.mainUse,
      });
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting test drive request:', error);
      // Still show success to user, but log the error
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation completes
    setTimeout(() => {
      setCurrentStep(0);
      setIsCompleted(false);
      setAnswers({
        name: '',
        age: '',
        lastVehicle: '',
        interests: '',
        mainUse: '',
      });
    }, 300);
  };

  const updateAnswer = (value: string) => {
    // For age field, only allow numbers
    if (currentQuestion.id === 'age') {
      const numericValue = value.replace(/\D/g, '');
      setAnswers({
        ...answers,
        [currentQuestion.id]: numericValue,
      });
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: value,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/[.08] shadow-2xl shadow-black/40 backdrop-blur-sm">
            {/* Header */}
            <div className="relative border-b border-white/[.06] px-8 pt-6 pb-5">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-white/[.04] hover:bg-white/[.08] border border-white/[.06] flex items-center justify-center cursor-pointer transition-all duration-200 text-white/60 hover:text-white/90"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="m-0 text-white" style={{ fontSize: '22px', fontWeight: 700 }}>
                Solicitar Prueba de Manejo
              </h2>
              <p className="m-0 mt-1 text-white/50" style={{ fontSize: '14px', fontWeight: 500 }}>
                Completa estos datos para agendar tu prueba
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {isCompleted ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 grid place-items-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="m-0 mb-2 text-xl font-bold text-white">¡Gracias {answers.name}!</h3>
                  <p className="m-0 text-white/60" style={{ fontSize: '15px', fontWeight: 500 }}>
                    Hemos recibido tu información. Nuestro equipo se pondrá en contacto contigo pronto para coordinar la prueba de manejo.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 transition-all duration-200"
                    style={{ fontSize: '15px', fontWeight: 600 }}
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  {/* Progress indicator */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/40 uppercase" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}>
                        PASO {currentStep + 1} DE {questions.length}
                      </span>
                      <span className="text-white/40" style={{ fontSize: '13px', fontWeight: 600 }}>
                        {Math.round(((currentStep + 1) / questions.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <div className="min-h-[200px]">
                    <h3 className="m-0 mb-6 text-white" style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                      {currentQuestion.question}
                    </h3>

                    {currentQuestion.type === 'text' ? (
                      <input
                        type={currentQuestion.id === 'age' ? 'tel' : 'text'}
                        inputMode={currentQuestion.id === 'age' ? 'numeric' : 'text'}
                        value={currentValue}
                        onChange={(e) => updateAnswer(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && isValidValue(currentValue, currentQuestion.id)) {
                            handleNext();
                          }
                        }}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[.02] text-white px-4 py-3.5 outline-none focus:border-blue-500/50 focus:bg-white/[.04] transition-all duration-200"
                        placeholder={currentQuestion.placeholder}
                        style={{ fontSize: '16px', fontWeight: 500 }}
                        autoFocus
                      />
                    ) : (
                      <textarea
                        value={currentValue}
                        onChange={(e) => updateAnswer(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && isValidValue(currentValue, currentQuestion.id)) {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
                        className="w-full min-h-[100px] resize-none rounded-xl border border-white/[0.08] bg-white/[.02] text-white px-4 py-3.5 outline-none focus:border-blue-500/50 focus:bg-white/[.04] transition-all duration-200"
                        placeholder={currentQuestion.placeholder}
                        style={{ fontSize: '16px', fontWeight: 500 }}
                        autoFocus
                      />
                    )}

                    <p className="mt-3 text-white/30" style={{ fontSize: '12px', fontWeight: 500 }}>
                      Presiona Enter para continuar
                    </p>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex gap-3 mt-6">
                    {currentStep > 0 && (
                      <button
                        onClick={handleBack}
                        className="h-11 px-5 rounded-xl border border-white/[0.08] bg-white/[.04] hover:bg-white/[.06] text-white/90 inline-flex items-center gap-2 cursor-pointer transition-all duration-200"
                        style={{ fontSize: '15px', fontWeight: 600 }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Atrás
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={!isValidValue(currentValue, currentQuestion.id) || isSubmitting}
                      className="flex-1 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/[.06] disabled:text-white/30 text-white inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed"
                      style={{ fontSize: '15px', fontWeight: 600 }}
                    >
                      {isSubmitting ? 'Enviando...' : currentStep === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
                      {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
