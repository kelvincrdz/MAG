import React, { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import Button from "../common/Button";
import Modal from "../common/Modal";
import Input from "../common/Input";

const ResourceBar = ({ resource, onChange, onDelete, disabled = false }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedResource, setEditedResource] = useState(resource);
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);

  const percentage = Math.round((resource.current / resource.max) * 100);

  const handleQuickChange = (delta) => {
    const newCurrent = Math.max(
      0,
      Math.min(resource.max, resource.current + delta)
    );
    onChange({ ...resource, current: newCurrent });
  };

  const handleSaveEdit = () => {
    onChange(editedResource);
    setShowEditModal(false);
  };

  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  return (
    <>
      <div className="space-y-2">
        {/* Header com nome e controles */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-text">{resource.name}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickChange(-1)}
              disabled={disabled}
            >
              -
            </Button>
            {isEditingCurrent ? (
              <input
                type="number"
                value={resource.current}
                onChange={(e) =>
                  onChange({
                    ...resource,
                    current: parseInt(e.target.value) || 0,
                  })
                }
                onBlur={() => setIsEditingCurrent(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingCurrent(false);
                }}
                className="w-20 px-2 py-1 bg-background border border-primary rounded text-center text-text font-mono focus:outline-none"
                min="0"
                max={resource.max}
                autoFocus
              />
            ) : (
              <button
                onClick={() => !disabled && setIsEditingCurrent(true)}
                className="font-mono font-bold text-lg text-text hover:text-primary cursor-pointer min-w-[80px] text-center"
              >
                {resource.current} / {resource.max}
              </button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickChange(1)}
              disabled={disabled}
            >
              +
            </Button>
            {!disabled && (
              <>
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => setShowEditModal(true)}
                  icon={<Edit2 size={16} />}
                />
                <Button
                  variant="icon"
                  size="icon"
                  onClick={onDelete}
                  icon={<Trash2 size={16} className="text-red-400" />}
                />
              </>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="relative h-8 bg-background rounded-lg overflow-hidden border border-border">
          {/* Fundo da barra */}
          <div
            className="absolute inset-0 transition-all duration-300 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: resource.color,
              opacity: 0.3,
            }}
          />
          {/* Gradiente overlay */}
          <div
            className="absolute inset-0 transition-all duration-300 ease-out"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${resource.color}80 0%, ${resource.color} 100%)`,
            }}
          />
          {/* Texto centralizado */}
          <div
            className="absolute inset-0 flex items-center justify-center font-bold text-sm"
            style={{ color: getContrastColor(resource.color) }}
          >
            {percentage}%
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar ${resource.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={editedResource.name}
            onChange={(e) =>
              setEditedResource({ ...editedResource, name: e.target.value })
            }
          />
          <Input
            label="Valor Máximo"
            type="number"
            value={editedResource.max}
            onChange={(e) =>
              setEditedResource({
                ...editedResource,
                max: parseInt(e.target.value) || 1,
              })
            }
            min="1"
          />
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">
              Cor
            </label>
            <HexColorPicker
              color={editedResource.color}
              onChange={(color) =>
                setEditedResource({ ...editedResource, color })
              }
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              className="flex-1"
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const ResourceBarList = ({ resources = [], onChange, disabled = false }) => {
  const handleAdd = () => {
    const newResource = {
      id: crypto.randomUUID(),
      name: "Novo Recurso",
      current: 100,
      max: 100,
      color: "#d8263e",
    };
    onChange([...resources, newResource]);
  };

  const handleUpdate = (index, updated) => {
    const newResources = [...resources];
    newResources[index] = updated;
    onChange(newResources);
  };

  const handleDelete = (index) => {
    onChange(resources.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">Barras de Recursos</h3>
        {!disabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            icon={<Plus size={16} />}
          >
            Adicionar
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {resources.length === 0 ? (
          <p className="text-textMuted text-sm text-center py-4">
            Nenhuma barra de recurso adicionada ainda
          </p>
        ) : (
          resources.map((resource, index) => (
            <ResourceBar
              key={resource.id}
              resource={resource}
              onChange={(updated) => handleUpdate(index, updated)}
              onDelete={() => handleDelete(index)}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ResourceBarList;
