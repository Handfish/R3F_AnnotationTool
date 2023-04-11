import { CSSProperties, FC } from 'react'
import { useDrag } from 'react-dnd'
import { ItemTypes } from './ItemTypes';
import type { IconData } from '../@types/custom-typings';

const style: CSSProperties = {
  cursor: 'move',
  float: 'left',
}

export interface DndProps {
  children?: React.ReactNode;
  icon: IconData,
  name: string,
}

// interface DropResult {
// 	name: string
// }


/**
* React Drag and Drop parent component
*   enables drag capability for icons
*/
export const DndIcon: FC<DndProps> = function Box({ children, icon, name }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ICON,
    item: { name, icon },
    // end: (item, monitor) => {
    // const dropResult = monitor.getDropResult<DropResult>()
    // if (item && dropResult) {
    // 	alert(`You dropped ${item.name} into ${dropResult.name}!`)
    // }
    // },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }))

  const opacity = isDragging ? 0.4 : 1
  return (
    <div
      ref={drag}
      style={{ ...style, opacity }}
      data-testid={`Dnd${name}`}
    >
      {children}
    </div>
  )
}
