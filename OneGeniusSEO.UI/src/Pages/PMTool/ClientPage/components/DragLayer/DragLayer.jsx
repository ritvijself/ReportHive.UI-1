import { useDragLayer } from "react-dnd";
import { DND_TYPES } from "../../constants";

const DragLayer = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !item || !currentOffset) {
    return null;
  }

  const { x, y } = currentOffset;

  const layerStyles = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 100,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  };

  const itemStyles = {
    transform: `translate(${x}px, ${y}px)`,
  };

  const renderItem = () => {
    switch (item.type) {
      case DND_TYPES.LIST:
        return (
          <div
            className="tw:w-72 tw:bg-white tw:rounded-lg tw:shadow-lg tw:border-2 tw:border-blue-400 tw:opacity-90"
            style={itemStyles}
          >
            <div className="tw:p-4 tw:border-b">
              <h3 className="tw:font-semibold tw:text-white-700">
                {item.title}
              </h3>
            </div>
            <div className="tw:p-4 tw:text-sm tw:text-gray-500">
              {item.cardCount} cards
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div style={layerStyles}>{renderItem()}</div>;
};

export default DragLayer;
