import React, { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import Button from "../common/Button";
import Badge from "../common/Badge";

const AttributeItem = ({ attribute, onChange, onDelete }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleValueChange = (delta) => {
    onChange({ ...attribute, value: Math.max(0, attribute.value + delta) });
  };

  const handleNameChange = (newName) => {
    onChange({ ...attribute, name: newName });
    setIsEditingName(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border group">
      {/* Drag handle */}
      <div className="cursor-move text-textDim">
        <GripVertical size={20} />
      </div>

      {/* Color indicator & picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-8 h-8 rounded border-2 border-border hover:border-borderHover transition-colors"
          style={{ backgroundColor: attribute.color }}
        />
        {showColorPicker && (
          <div className="absolute z-10 top-10 left-0">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(false)}
            />
            <div className="relative bg-surface p-3 rounded-lg shadow-xl border border-border">
              <HexColorPicker
                color={attribute.color}
                onChange={(color) => onChange({ ...attribute, color })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      {isEditingName ? (
        <input
          type="text"
          value={attribute.name}
          onChange={(e) => onChange({ ...attribute, name: e.target.value })}
          onBlur={(e) => handleNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNameChange(e.target.value);
            if (e.key === "Escape") setIsEditingName(false);
          }}
          className="flex-1 px-2 py-1 bg-background border border-primary rounded text-text focus:outline-none"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditingName(true)}
          className="flex-1 font-semibold text-text cursor-pointer hover:text-primary"
        >
          {attribute.name}
        </span>
      )}

      {/* Value controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleValueChange(-1)}
        >
          -
        </Button>
        <span className="font-mono font-bold text-lg text-primary w-12 text-center">
          +{attribute.value}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleValueChange(1)}
        >
          +
        </Button>
      </div>

      {/* Delete button */}
      <Button
        variant="icon"
        size="icon"
        onClick={onDelete}
        icon={<Trash2 size={16} className="text-red-400" />}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
};

const AttributeList = ({ attributes = [], onChange, disabled = false }) => {
  const handleAdd = () => {
    const newAttr = {
      id: crypto.randomUUID(),
      name: "Novo Atributo",
      value: 0,
      color: "#d8263e",
    };
    onChange([...attributes, newAttr]);
  };

  const handleUpdate = (index, updated) => {
    const newAttrs = [...attributes];
    newAttrs[index] = updated;
    onChange(newAttrs);
  };

  const handleDelete = (index) => {
    onChange(attributes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">Atributos</h3>
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

      <div className="space-y-2">
        {attributes.length === 0 ? (
          <p className="text-textMuted text-sm text-center py-4">
            Nenhum atributo adicionado ainda
          </p>
        ) : (
          attributes.map((attr, index) => (
            <AttributeItem
              key={attr.id}
              attribute={attr}
              onChange={(updated) => handleUpdate(index, updated)}
              onDelete={() => handleDelete(index)}
            />
          ))
        )}
      </div>

      {/* Preview badges */}
      {attributes.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
          <span className="text-sm text-textMuted">Preview:</span>
          {attributes.map((attr) => (
            <Badge key={attr.id} color={attr.color}>
              {attr.name} +{attr.value}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttributeList;
