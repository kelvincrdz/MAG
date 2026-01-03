import React, { useState, useEffect } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import { Textarea } from "../common/Input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NotesEditor = ({
  notes = "",
  onChange,
  readOnly = false,
  autoSave = true,
}) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (!autoSave || readOnly) return;

    const timer = setTimeout(() => {
      if (localNotes !== notes) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [localNotes, notes, autoSave, readOnly]);

  const handleSave = async () => {
    setIsSaving(true);
    await onChange(localNotes);
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 500);
  };

  const formatTimestamp = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">Notas</h3>
        <div className="flex items-center gap-3">
          {!readOnly && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-textMuted hover:text-text flex items-center gap-1"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? "Editar" : "Preview"}
            </button>
          )}
          {isSaving ? (
            <span className="text-sm text-textMuted flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Salvando...
            </span>
          ) : lastSaved ? (
            <span className="text-sm text-textMuted">
              Salvo às {formatTimestamp(lastSaved)}
            </span>
          ) : null}
        </div>
      </div>

      {showPreview && !readOnly ? (
        <div className="p-4 bg-background rounded-lg border border-border prose prose-invert max-w-none custom-scrollbar max-h-96 overflow-y-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {localNotes || "*Nenhuma nota ainda*"}
          </ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={localNotes}
          onChange={(e) => !readOnly && setLocalNotes(e.target.value)}
          placeholder={
            readOnly
              ? "Nenhuma nota disponível"
              : "Escreva suas notas aqui... Suporta Markdown!"
          }
          rows={8}
          disabled={readOnly}
        />
      )}

      {readOnly && (
        <p className="text-sm text-textMuted italic">
          Você só pode visualizar estas notas
        </p>
      )}
    </div>
  );
};

export default NotesEditor;
