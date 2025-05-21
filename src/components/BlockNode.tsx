import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from "reactflow";
import { Plus, Type, Image, Component, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

interface Step {
  id: string;
  type: "text" | "image" | "component";
  content?: string;
}

interface BlockNodeProps {
  data: {
    label: string;
    steps: Step[];
    onAddStep: (type: string) => void;
    onDeleteStep: (stepId: string) => void;
    onDeleteBlock: () => void;
    onStepSelect?: (step: Step) => void;
    onReorderSteps?: (steps: Step[]) => void;
  };
  selected?: boolean;
  dragging?: boolean;
}

const SortableStep = memo(
  ({ step, blockId, onContextMenu, onClick, zoomLevel }: any) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: step.id,
      data: {
        type: "step",
      },
    });

    const style = {
      transform: CSS.Transform.toString({
        x: transform?.x ? transform.x / zoomLevel : 0,
        y: transform?.y ? transform.y / zoomLevel : 0,
        scaleX: transform?.scaleX ?? 1,
        scaleY: transform?.scaleY ?? 1,
      }),
      transition,
      zIndex: isDragging ? 1000 : 1,
      position: "relative" as const,
      touchAction: "none",
    };

    const handleStepClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick(step);
    };

    const handleContextMenuClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, step.id);
    };

    const targetHandleId = `step-target-${step.id}`;
    const sourceHandleId = `step-source-${step.id}`;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`step-item ${isDragging ? "dragging" : ""}`}
        data-dragging={isDragging}
      >
        <div
          className={`flex items-start p-2 bg-gray-50 rounded-md border ${
            isDragging
              ? "border-blue-400 bg-blue-50 shadow-lg"
              : "border-gray-200"
          } hover:bg-gray-100 cursor-grab active:cursor-grabbing`}
          onContextMenu={handleContextMenuClick}
          onClick={handleStepClick}
        >
          <Handle
            type="target"
            position={Position.Left}
            id={targetHandleId}
            className="w-2 h-2 !bg-blue-500"
          />

          <Handle
            type="source"
            position={Position.Right}
            id={sourceHandleId}
            className="w-2 h-2 !bg-blue-500"
            isConnectable={true}
          />

          <div className="flex-shrink-0 mt-1">
            {step.type === "text" && (
              <Type size={16} className="text-gray-500" />
            )}
            {step.type === "image" && (
              <Image size={16} className="text-gray-500" />
            )}
            {step.type === "component" && (
              <Component size={16} className="text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0 ml-3">
            <div className="text-sm text-gray-600 font-medium mb-1">
              {step.type === "text"
                ? "Text"
                : step.type === "image"
                ? "Capture"
                : "Component"}
            </div>
            {step.type === "text" && step.content && (
              <div
                className="text-xs text-gray-500 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: highlightVariables(step.content),
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

const BlockNode = ({
  id,
  data,
  selected,
  dragging,
}: BlockNodeProps & { id: string }) => {
  const [showStepMenu, setShowStepMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    stepId: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBlockDragging, setIsBlockDragging] = useState(false);
  const { getZoom } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const zoomLevel = getZoom();
  const blockRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 / zoomLevel,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const stepTypes = [
    { icon: Type, label: "Add Text", type: "text" },
    { icon: Image, label: "Capture", type: "image" },
    { icon: Component, label: "Component", type: "component" },
  ];

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, stepId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        stepId,
      });
    },
    []
  );

  const handleDeleteStep = useCallback(
    (stepId: string) => {
      data.onDeleteStep(stepId);
      setContextMenu(null);
    },
    [data]
  );

  const handleBlockContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (data.steps.length === 0) {
        data.onDeleteBlock();
      }
    },
    [data]
  );

  const handleStepClick = (step: Step) => {
    data.onStepSelect?.(step);
  };

  const highlightVariables = (text: string) => {
    if (!text) return "";
    return text.replace(
      /\{\{([^}]+)\}\}/g,
      (match, variable) =>
        `<span class="bg-blue-100 text-blue-800 rounded px-1">${match}</span>`
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    document.body.classList.add("dragging");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    document.body.classList.remove("dragging");

    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.steps.findIndex((step) => step.id === active.id);
      const newIndex = data.steps.findIndex((step) => step.id === over.id);
      const newSteps = arrayMove(data.steps, oldIndex, newIndex);
      data.onReorderSteps?.(newSteps);

      setTimeout(() => {
        updateNodeInternals(id);
      }, 0);
    }
  };

  const handleBlockMouseDown = useCallback((e: React.MouseEvent) => {
    if (
      e.target instanceof Element &&
      (e.target.closest(".block-header") || e.target.closest(".block-node"))
    ) {
      e.stopPropagation();
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      setIsBlockDragging(true);
      document.addEventListener("mousemove", handleBlockMouseMove);
      document.addEventListener("mouseup", handleBlockMouseUp);
    }
  }, []);

  const handleBlockMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isBlockDragging && dragStartPos.current) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          document.body.classList.add("block-dragging");
        }
      }
    },
    [isBlockDragging]
  );

  const handleBlockMouseUp = useCallback(() => {
    setIsBlockDragging(false);
    dragStartPos.current = null;
    document.body.classList.remove("block-dragging");
    document.removeEventListener("mousemove", handleBlockMouseMove);
    document.removeEventListener("mouseup", handleBlockMouseUp);
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleBlockMouseMove);
      document.removeEventListener("mouseup", handleBlockMouseUp);
    };
  }, [handleBlockMouseMove, handleBlockMouseUp]);

  return (
    <div
      ref={blockRef}
      className={`block-node bg-white rounded-lg shadow-lg border ${
        selected ? "border-blue-500" : "border-gray-200"
      } ${isDragging ? "dragging" : ""} ${
        isBlockDragging ? "block-dragging" : ""
      }`}
      onContextMenu={handleBlockContextMenu}
      onMouseDown={handleBlockMouseDown}
      style={{
        width: "300px",
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        cursor: isBlockDragging ? "grabbing" : "grab",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ top: 20 }}
        className="w-2 h-2 !bg-blue-500"
      />

      <Handle
        type="source"
        position={Position.Right}
        style={{ bottom: 20 }}
        className="w-2 h-2 !bg-blue-500"
      />
      <div className="block-header px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{data.label}</h3>
        {data.steps.length === 0 && (
          <button
            onClick={data.onDeleteBlock}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="block-content p-4 space-y-3 nodrag">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement, restrictToVerticalAxis]}
        >
          <SortableContext
            items={data.steps}
            strategy={verticalListSortingStrategy}
          >
            {data.steps.map((step) => (
              <SortableStep
                key={step.id}
                step={step}
                onContextMenu={handleContextMenu}
                onClick={handleStepClick}
                zoomLevel={zoomLevel}
                blockId={id}
              />
            ))}
          </SortableContext>
        </DndContext>

        <div className="relative mt-3">
          <button
            className="w-full px-4 py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-1"
            onClick={() => setShowStepMenu(!showStepMenu)}
          >
            <Plus size={16} />
            <span>Add Step</span>
          </button>

          {showStepMenu && (
            <div className="context-menu absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
              {stepTypes.map((type) => (
                <button
                  key={type.type}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  onClick={() => {
                    data.onAddStep(type.type);
                    setShowStepMenu(false);
                  }}
                >
                  <type.icon size={16} />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu absolute bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"
            onClick={() => handleDeleteStep(contextMenu.stepId)}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(BlockNode);
