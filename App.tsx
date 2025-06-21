
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { RouletteWheel } from './components/RouletteWheel'; // Corrected import path
import { ChevronRightIcon, PlusIcon, TrashIcon, SparklesIcon } from './components/Icons'; // Assuming Icons are in components/Icons.tsx

const PREDEFINED_COLORS = [
  "#EF4444", // red-500
  "#3B82F6", // blue-500
  "#22C55E", // green-500
  "#EAB308", // yellow-500
  "#A855F7", // purple-500
  "#EC4899", // pink-500
  "#F97316", // orange-500
  "#14B8A6", // teal-500
];

const App: React.FC = () => {
  const [items, setItems] = useState<string[]>(['Prize 1', 'Prize 2', 'Prize 3', 'Try Again', 'Bonus Spin', 'Nothing']);
  const [newItem, setNewItem] = useState<string>('');
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningItemIndex, setWinningItemIndex] = useState<number | null>(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState<boolean>(false);

  const itemColors = useMemo(() => {
    return items.map((_, index) => PREDEFINED_COLORS[index % PREDEFINED_COLORS.length]);
  }, [items]);

  const handleAddItem = useCallback(() => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems(prevItems => [...prevItems, newItem.trim()]);
      setNewItem('');
    } else if (items.includes(newItem.trim())) {
      alert("This item already exists in the roulette!");
    }
  }, [newItem, items]);

  const handleRemoveItem = useCallback((indexToRemove: number) => {
    setItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
    if (winningItemIndex === indexToRemove) {
      setWinningItemIndex(null);
      setShowWinnerPopup(false);
    } else if (winningItemIndex !== null && indexToRemove < winningItemIndex) {
      setWinningItemIndex(prev => prev! - 1);
    }
  }, [winningItemIndex]);

  const handleSpin = useCallback(() => {
    if (items.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setWinningItemIndex(null);
    setShowWinnerPopup(false);

    const randomIndex = Math.floor(Math.random() * items.length);
    const anglePerSegment = 360 / items.length;

    // Calculate the target angle for the middle of the winning segment to align with the top pointer (270 degrees)
    const winningSegmentCenterAngle = (randomIndex + 0.5) * anglePerSegment;
    const targetRestingAngle = (270 - winningSegmentCenterAngle + 360) % 360;

    const currentBaseAngle = (rotationDegrees % 360 + 360) % 360;
    let differenceToTarget = (targetRestingAngle - currentBaseAngle + 360) % 360;

    const additionalSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full spins
    const newRotationDegrees = rotationDegrees + (additionalSpins * 360) + differenceToTarget;

    setRotationDegrees(newRotationDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningItemIndex(randomIndex);
      setShowWinnerPopup(true);
    }, 7000); // Corresponds to animation duration (6s) + buffer (1s)
  }, [items, isSpinning, rotationDegrees]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddItem();
    }
  };

  useEffect(() => {
    if (!isSpinning && winningItemIndex !== null) {
      // Potentially trigger something else once winner is decided and shown
    }
  }, [isSpinning, winningItemIndex]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col items-center space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          ルーレット名人
        </h1>
        <p className="text-gray-600 mt-2 text-lg">項目を追加して運命の輪を回そう！</p>
      </header>

      <div className="w-full md:flex md:space-x-8">
        {/* Controls Section */}
        <div className="md:w-1/3 bg-white p-6 rounded-xl shadow-xl space-y-6 mb-8 md:mb-0">
          <div>
            <label htmlFor="newItem" className="block text-sm font-medium text-gray-700 mb-1">
              新しい項目
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="newItem"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="例：豪華ディナー"
                className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                disabled={isSpinning}
              />
              <button
                onClick={handleAddItem}
                disabled={isSpinning || !newItem.trim()}
                className="p-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition duration-150 flex items-center justify-center"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">現在の項目:</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm group"
                  >
                    <span className="text-gray-800 truncate" style={{ color: itemColors[index] }}>{item}</span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      disabled={isSpinning}
                      className="p-1 text-red-500 hover:text-red-700 opacity-50 group-hover:opacity-100 transition duration-150 disabled:opacity-25"
                      aria-label={`Remove ${item}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Roulette Section */}
        <div className="md:w-2/3 flex flex-col items-center space-y-6">
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            <RouletteWheel
              items={items}
              itemColors={itemColors}
              rotationDegrees={rotationDegrees}
              isSpinning={isSpinning}
            />
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 transform">
              <div className="w-0 h-0 
                    border-l-[15px] border-l-transparent
                    border-t-[25px] border-t-indigo-600
                    border-r-[15px] border-r-transparent shadow-lg">
              </div>
            </div>
          </div>
          <button
            onClick={handleSpin}
            disabled={isSpinning || items.length < 2}
            className="w-full md:w-auto px-12 py-4 bg-red-600 text-white text-xl font-semibold rounded-lg shadow-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-transform duration-150 transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <SparklesIcon className="w-6 h-6" />
            <span>スピン！</span>
          </button>
        </div>
      </div>

      {/* Winner Popup */}
      {showWinnerPopup && winningItemIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full transform transition-all duration-300 scale-100">
            <h2 className="text-3xl font-bold mb-4" style={{ color: itemColors[winningItemIndex] }}>おめでとう！</h2>
            <p className="text-5xl font-extrabold mb-6 p-4 rounded-lg" style={{ backgroundColor: `${itemColors[winningItemIndex]}20`, color: itemColors[winningItemIndex] }}>
              {items[winningItemIndex]}
            </p>
            <button
              onClick={() => setShowWinnerPopup(false)}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} ルーレット名人. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
