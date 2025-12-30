/**
 * Drag and Drop Hook
 *
 * Encapsulates interact.js setup for card dragging and dropping.
 * Handles:
 * - Making .draggable elements draggable
 * - Setting up .dropzone elements to accept drops
 * - Proper cleanup on unmount
 */

import { useEffect, useRef, useCallback } from 'react';
import interact from 'interactjs';

interface UseDragAndDropOptions {
  /** Called when a card is dropped on a cell. Receives (rowIndex, columnIndex) */
  onDrop: (rowIndex: number, columnIndex: number) => void;
  /** Called when dragging over a cell. Returns true if placement is valid */
  isPlacementValid?: (rowIndex: number, columnIndex: number) => boolean;
  /** Whether drag and drop is enabled */
  enabled?: boolean;
}

/**
 * Hook to manage drag and drop for game board
 */
export function useDragAndDrop({ onDrop, isPlacementValid, enabled = true }: UseDragAndDropOptions): void {
  // Use refs to hold current callbacks (avoids stale closure issues)
  const onDropRef = useRef(onDrop);
  const isPlacementValidRef = useRef(isPlacementValid);

  // Keep refs in sync
  useEffect(() => {
    onDropRef.current = onDrop;
    isPlacementValidRef.current = isPlacementValid;
  }, [onDrop, isPlacementValid]);

  // Set up interact.js
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Enable dynamic drop zone detection
    interact.dynamicDrop(true);

    // Track drag position
    const position = { x: 0, y: 0 };

    // Set up draggable elements
    const draggable = interact('.draggable').draggable({
      autoScroll: {
        container: '.scroll-container',
        margin: 70,
        speed: 1000,
      },
      inertia: true,
      max: 1,
      listeners: {
        start(event) {
          // Reset transform on drag start
          event.target.style.transform = 'translate(0px, 0px)';
        },
        move(event) {
          // Update position during drag
          position.x += event.dx;
          position.y += event.dy;
          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
        },
        end(event) {
          // Reset position on drag end
          position.x = 0;
          position.y = 0;
          event.target.style.transform = 'translate(0px, 0px)';
        },
      },
    });

    // Set up drop zones
    const dropzone = interact('.dropzone').dropzone({
      accept: '.draggable',
      overlap: 0.4,
      ondragenter(event) {
        event.target.classList.add('drop-target');

        // Check if placement is valid and add error class if not
        if (isPlacementValidRef.current) {
          const targetId = event.target.id || '';
          const parts = targetId.split('-');
          if (parts.length === 2) {
            const rowIndex = Number(parts[0]);
            const columnIndex = Number(parts[1]);
            const isValid = isPlacementValidRef.current(rowIndex, columnIndex);
            if (!isValid) {
              event.target.classList.add('drop-error');
            }
          }
        }
      },
      ondragleave(event) {
        event.target.classList.remove('drop-target');
        event.target.classList.remove('drop-error');
      },
      ondrop(event) {
        // Parse cell coordinates from element id (format: "rowIndex-columnIndex")
        const target = event.currentTarget.id.split('-');
        const rowIndex = Number(target[0]);
        const columnIndex = Number(target[1]);

        // Call the drop handler via ref (avoids stale closure)
        onDropRef.current(rowIndex, columnIndex);

        event.stopImmediatePropagation();
      },
      ondropdeactivate(event) {
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
        event.target.classList.remove('drop-error');
      },
    });

    // Cleanup on unmount
    return () => {
      draggable.unset();
      dropzone.unset();
    };
  }, [enabled]);
}
