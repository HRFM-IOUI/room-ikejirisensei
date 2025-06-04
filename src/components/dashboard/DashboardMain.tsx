import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableBlock from "./SortableBlock";
import { Block } from "./dashboardConstants";
import styles from "./Dashboard.module.css";
import { FaPlusCircle } from "react-icons/fa"; // ガイド用アイコン

type Props = {
  blocks: Block[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  handleEditBlock: (id: string, value: string) => void;
  handleDelete: (id: string) => void;
  handleDragEnd: (oldIndex: number, newIndex: number) => void;
};

export default function DashboardMain({
  blocks,
  selectedId,
  setSelectedId,
  handleEditBlock,
  handleDelete,
  handleDragEnd,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over?.id);
      handleDragEnd(oldIndex, newIndex);
    }
  }

  return (
    <section className={styles.dashboardMainSection}>
      {blocks.length === 0 && (
        <div
          style={{
            color: "#192349",
            textAlign: "center",
            margin: "55px 0 60px 0",
            fontSize: 20,
            opacity: 0.85,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <FaPlusCircle size={48} style={{ color: "#5b8dee", marginBottom: 10 }} />
          <span>左の「＋ブロック追加」から好きな要素をドラッグできます</span>
          <span style={{ fontSize: 15, color: "#555" }}>
            <strong>ヒント：</strong> 見出し・テキスト・画像・動画を自由に追加・並べ替え可能！
          </span>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((b) => (
            <SortableBlock
              key={b.id}
              block={b}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              handleEditBlock={handleEditBlock}
              handleDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </section>
  );
}
