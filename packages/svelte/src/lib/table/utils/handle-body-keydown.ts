import { trackInteractionModality } from '../../primitives/input-modality';
import type { TableContext } from '../root/context';

type TableBodyKeydownOptions = {
  event: KeyboardEvent;
  table: Pick<
    TableContext,
    'selectionMode' | 'selectAllRows' | 'moveToGridStart' | 'moveToGridEnd' | 'moveFocus'
  >;
  focusTarget: HTMLElement | null | undefined;
  isDisabled: boolean;
  onHome: () => void;
  onEnd: () => void;
  onEnter: () => void;
  onSpace: () => void;
};

function getInteraction(event: KeyboardEvent) {
  return {
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    altKey: event.altKey
  };
}

export function handleTableBodyKeydown({
  event,
  table,
  focusTarget,
  isDisabled,
  onHome,
  onEnd,
  onEnter,
  onSpace
}: TableBodyKeydownOptions) {
  trackInteractionModality(event, focusTarget ?? null);

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
    if (table.selectionMode === 'multiple') {
      event.preventDefault();
      table.selectAllRows();
    }
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
    event.preventDefault();
    table.moveToGridStart();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'End') {
    event.preventDefault();
    table.moveToGridEnd();
    return;
  }

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      table.moveFocus('up', getInteraction(event));
      return;
    case 'ArrowDown':
      event.preventDefault();
      table.moveFocus('down', getInteraction(event));
      return;
    case 'ArrowLeft':
      event.preventDefault();
      table.moveFocus('left');
      return;
    case 'ArrowRight':
      event.preventDefault();
      table.moveFocus('right');
      return;
    case 'Home':
      event.preventDefault();
      onHome();
      return;
    case 'End':
      event.preventDefault();
      onEnd();
      return;
    case 'Enter':
      event.preventDefault();
      if (event.repeat || isDisabled) return;
      onEnter();
      return;
    case ' ':
      event.preventDefault();
      if (event.repeat || isDisabled) return;
      onSpace();
      return;
  }
}
