import { useState } from "react";
import {
  Plus,
  Brain,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  X,
  Check,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import { trpc } from "../trpc";

type ViewMode = "manage" | "review";

export default function FlashcardsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("manage");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col">
      {viewMode === "manage" ? (
        <ManageView
          onStartReview={() => setViewMode("review")}
          onCreateNew={() => setShowCreateModal(true)}
          onEdit={setEditingCard}
        />
      ) : (
        <ReviewView onBack={() => setViewMode("manage")} />
      )}

      {showCreateModal && (
        <CreateCardModal onClose={() => setShowCreateModal(false)} />
      )}

      {editingCard && (
        <EditCardModal
          cardId={editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}

// ===== Stats Bar =====
function StatsBar({ onStartReview }: { onStartReview: () => void }) {
  const stats = trpc.flashcards.stats.useQuery();

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
            <Brain size={16} className="text-pink-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-lg font-bold text-slate-800">
              {stats.data?.total ?? 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Target size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Pendentes</p>
            <p className="text-lg font-bold text-amber-600">
              {stats.data?.due ?? 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <TrendingUp size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Revisados hoje</p>
            <p className="text-lg font-bold text-green-600">
              {stats.data?.reviewedToday ?? 0}
            </p>
          </div>
        </div>
      </div>

      {(stats.data?.due ?? 0) > 0 && (
        <button
          onClick={onStartReview}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
        >
          <Zap size={16} />
          Revisar ({stats.data?.due})
        </button>
      )}
    </div>
  );
}

// ===== Manage View =====
function ManageView({
  onStartReview,
  onCreateNew,
  onEdit,
}: {
  onStartReview: () => void;
  onCreateNew: () => void;
  onEdit: (id: string) => void;
}) {
  const cards = trpc.flashcards.list.useQuery();
  const deleteCard = trpc.flashcards.delete.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async (id: string) => {
    await deleteCard.mutateAsync({ id });
    utils.flashcards.list.invalidate();
    utils.flashcards.stats.invalidate();
  };

  return (
    <>
      <StatsBar onStartReview={onStartReview} />

      <div className="flex items-center justify-between px-6 py-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Todos os Cards ({cards.data?.length ?? 0})
        </h2>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Plus size={14} />
          Novo Card
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6">
        {cards.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Brain size={48} className="mb-4 text-pink-300" />
            <p className="text-lg font-medium text-slate-500">
              Nenhum flashcard ainda
            </p>
            <p className="text-sm mt-1">
              Crie seus primeiros cards para comecar a estudar
            </p>
            <button
              onClick={onCreateNew}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus size={16} />
              Criar Flashcard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.data?.map((card: any) => {
              const isDue = new Date(card.nextReview) <= new Date();
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isDue
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isDue ? "Pendente" : `${card.interval}d`}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(card.id)}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <Edit3 size={12} className="text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Frente</p>
                    <p className="text-sm font-medium text-slate-800 line-clamp-2">
                      {card.front}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">Verso</p>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {card.back}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400">
                    <span>EF: {card.easeFactor}</span>
                    <span>Reps: {card.repetitions}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ===== Review View =====
function ReviewView({ onBack }: { onBack: () => void }) {
  const dueCards = trpc.flashcards.getDueToday.useQuery();
  const reviewMutation = trpc.flashcards.review.useMutation();
  const utils = trpc.useUtils();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const cards = dueCards.data ?? [];
  const currentCard = cards[currentIndex];
  const totalDue = cards.length;

  const handleRate = async (rating: number) => {
    if (!currentCard) return;
    await reviewMutation.mutateAsync({ id: currentCard.id, rating });

    setReviewedCount((c) => c + 1);
    setFlipped(false);

    if (currentIndex + 1 < totalDue) {
      setCurrentIndex((i) => i + 1);
    } else {
      // All done - refetch
      utils.flashcards.getDueToday.invalidate();
      utils.flashcards.stats.invalidate();
      utils.flashcards.list.invalidate();
      setCurrentIndex(0);
    }
  };

  const ratingLabels = [
    { label: "Esqueci", color: "bg-red-500 hover:bg-red-600", value: 0 },
    { label: "Muito difícil", color: "bg-orange-500 hover:bg-orange-600", value: 1 },
    { label: "Difícil", color: "bg-amber-500 hover:bg-amber-600", value: 2 },
    { label: "Ok", color: "bg-yellow-500 hover:bg-yellow-600", value: 3 },
    { label: "Fácil", color: "bg-lime-500 hover:bg-lime-600", value: 4 },
    { label: "Muito fácil", color: "bg-green-500 hover:bg-green-600", value: 5 },
  ];

  if (totalDue === 0 || !currentCard) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check size={36} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Tudo revisado!
        </h2>
        <p className="text-slate-500 mb-1">
          {reviewedCount > 0
            ? `Voce revisou ${reviewedCount} card${reviewedCount > 1 ? "s" : ""} nesta sessao.`
            : "Nenhum card pendente para revisao."}
        </p>
        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {currentIndex + 1} / {totalDue}
          </span>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / totalDue) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div
          onClick={() => setFlipped(!flipped)}
          className="w-full max-w-lg min-h-[280px] bg-white rounded-2xl border-2 border-slate-200 shadow-lg cursor-pointer flex flex-col items-center justify-center p-8 hover:shadow-xl transition-shadow select-none"
        >
          {!flipped ? (
            <>
              <span className="text-xs text-pink-500 font-medium uppercase tracking-wider mb-4">
                Frente
              </span>
              <p className="text-xl text-center font-medium text-slate-800 leading-relaxed">
                {currentCard.front}
              </p>
              <p className="mt-6 text-xs text-slate-400">
                Clique para virar
              </p>
            </>
          ) : (
            <>
              <span className="text-xs text-purple-500 font-medium uppercase tracking-wider mb-4">
                Verso
              </span>
              <p className="text-xl text-center text-slate-700 leading-relaxed">
                {currentCard.back}
              </p>
            </>
          )}
        </div>

        {/* Rating buttons */}
        {flipped && (
          <div className="mt-8 space-y-3">
            <p className="text-center text-sm text-slate-500 mb-2">
              Como foi?
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {ratingLabels.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleRate(r.value)}
                  disabled={reviewMutation.isPending}
                  className={`px-3 py-2 text-sm text-white rounded-lg ${r.color} transition-colors disabled:opacity-50`}
                >
                  <span className="block font-medium">{r.value}</span>
                  <span className="block text-[10px] opacity-80">
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!flipped && (
          <button
            onClick={() => setFlipped(true)}
            className="mt-6 flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <RotateCcw size={16} />
            Mostrar Resposta
          </button>
        )}
      </div>
    </div>
  );
}

// ===== Create Card Modal =====
function CreateCardModal({ onClose }: { onClose: () => void }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const createCard = trpc.flashcards.create.useMutation();
  const utils = trpc.useUtils();

  const handleCreate = async () => {
    if (!front.trim() || !back.trim()) return;
    await createCard.mutateAsync({ front: front.trim(), back: back.trim() });
    utils.flashcards.list.invalidate();
    utils.flashcards.stats.invalidate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Novo Flashcard</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Frente (pergunta)
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              placeholder="Ex: O que e o padrao Observer?"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-pink-400 resize-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Verso (resposta)
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={3}
              placeholder="Ex: Um padrao comportamental que define uma dependencia um-para-muitos..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-pink-400 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!front.trim() || !back.trim() || createCard.isPending}
            className="px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
          >
            Criar Card
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Edit Card Modal =====
function EditCardModal({
  cardId,
  onClose,
}: {
  cardId: string;
  onClose: () => void;
}) {
  const card = trpc.flashcards.getById.useQuery({ id: cardId });
  const updateCard = trpc.flashcards.update.useMutation();
  const utils = trpc.useUtils();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loaded, setLoaded] = useState(false);

  if (card.data && !loaded) {
    setFront(card.data.front);
    setBack(card.data.back);
    setLoaded(true);
  }

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) return;
    await updateCard.mutateAsync({
      id: cardId,
      front: front.trim(),
      back: back.trim(),
    });
    utils.flashcards.list.invalidate();
    onClose();
  };

  if (!card.data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Editar Flashcard</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Frente
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-pink-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Verso
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-pink-400 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!front.trim() || !back.trim() || updateCard.isPending}
            className="px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
