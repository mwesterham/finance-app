"use client";

import { ReactNode, useState } from "react";
import {
  DndContext,
  pointerWithin,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cx } from "../util/util";

export interface ItemType {
  id: number;
  text: string;
};

const SortableItem = ({ item, render }: { item: ItemType, render: (item: ItemType) => ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {render(item)}
    </div>
  );
};

const DroppableContainer = ({ id, items, children }: { id: string; items: ItemType[]; children: React.ReactNode }) => {
  const { isOver, setNodeRef, active, over } = useDroppable({ id });

  const style = {
    color: isOver ? 'green' : undefined,
  };

  return (
    <div ref={setNodeRef} className={cx("w-1/2 bg-gray-100 rounded-lg shadow-md min-h-[200px]", isOver && active.id !== over.id ? "bg-green-300" : "")}>
      {children}
    </div>
  );
};

const ListSortableContext = ({items, id, title, render}: {items: ItemType[], id: string, title: string, render: (item: ItemType) => ReactNode}) => {
  return <>
    
    <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      <DroppableContainer id={id} items={items}>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="flex flex-row justify-center">
          <div className="flex flex-col justify-center">
            {items.map((item) => {
              return <>
                <div className="">
                  <SortableItem key={item.id} item={item} render={render}/>
                </div>
              </>
            })}
          </div>
        </div>
      </DroppableContainer>
    </SortableContext>
  </>
}

interface DraggableListProps {
  selectedItems: ItemType[];
  availableItems: ItemType[];
  onDragEndCallback: (selectedItems: ItemType[], availableItems: ItemType[]) => void;
  renderItem: (item: ItemType) => ReactNode;
}

const DraggableList = (props : DraggableListProps) => {
  const [selectedItems, setSelectedItems] = useState<ItemType[]>(props.selectedItems);
  const [availableItems, setAvailableItems] = useState<ItemType[]>(props.availableItems);

  const selectedContainerId = "selected-container";
  const availableContainerId = "available-container";

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeList = selectedItems.some((item) => item.id === active.id) ? "selected" : "available";
    const overList = over.id === selectedContainerId ? "selected" :
      over.id === availableContainerId ? "available" : activeList;

      let newSelectedItems = selectedItems, newAvailableItems = availableItems;

    if (activeList === overList) {
      const items = activeList === "selected" ? selectedItems : availableItems;
      const setItems = activeList === "selected" ? setSelectedItems : setAvailableItems;

      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);

      
      if (activeList === "selected") {
        props.onDragEndCallback(reordered, availableItems);
      } else {
        props.onDragEndCallback(selectedItems, reordered);
      }
    } else {
      if (activeList === "available") {
        const movedItem = availableItems.find((item) => item.id === active.id);
        if (movedItem) {
          newSelectedItems = [...selectedItems, movedItem];
          newAvailableItems = availableItems.filter((item) => item.id !== active.id);
        }
      } else {
        const movedItem = selectedItems.find((item) => item.id === active.id);
        if (movedItem) {
          newSelectedItems = selectedItems.filter((item) => item.id !== active.id);
          newAvailableItems = [...availableItems, movedItem];
        }
      }

      
      setSelectedItems(newSelectedItems);
      setAvailableItems(newAvailableItems);
      // callback
      props.onDragEndCallback(newSelectedItems, newAvailableItems);
    }
  };

  return (
    <DndContext collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      <div className="flex p-6">
        <ListSortableContext items={availableItems} id={availableContainerId} title={"Available Items"} render={props.renderItem}/>
        <ListSortableContext items={selectedItems} id={selectedContainerId} title={"Selected Items"} render={props.renderItem}/>
      </div>
    </DndContext>
  );
};

export default DraggableList;