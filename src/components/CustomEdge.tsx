import React, { useState } from "react";
import { BaseEdge, EdgeProps, getBezierPath, useReactFlow } from "reactflow";
import { X } from "lucide-react";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandle,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setShowDeleteButton(true);
  };

  const handleDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
    setShowDeleteButton(false);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "#2563eb",
        }}
      />
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        strokeLinecap="round"
        className="react-flow__edge-interaction"
        onClick={handleEdgeClick}
      />
      {showDeleteButton && (
        <foreignObject
          width={24}
          height={24}
          x={labelX - 12}
          y={labelY - 12}
          className="edge-delete-button"
          requiredExtensions="http://www.w3.org/1999/xhtml"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-center w-6 h-6 bg-red-50 rounded-full shadow-md border border-red-200 cursor-pointer hover:bg-red-100 hover:border-red-300 transition-colors"
            onClick={handleDelete}
          >
            <X size={14} className="text-red-500" />
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default CustomEdge;
