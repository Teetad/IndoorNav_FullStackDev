import React from "react";

type Props = {
  startValue: string;
  goalValue: string;
  roomNumbers: string[];
  searching: boolean;
  onStartChange: (v: string) => void;
  onGoalChange: (v: string) => void;
  onSearch: () => void;
};

export const SearchBar = React.forwardRef<HTMLElement, Props>(function SearchBar(
  { startValue, goalValue, roomNumbers, searching, onStartChange, onGoalChange, onSearch },
  ref
) {
  return (
    <section className="search" aria-label="Find route by room number" ref={ref}>
      <input
        type="text"
        placeholder="Start room number"
        value={startValue}
        onChange={(e) => onStartChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        list="room-numbers"
      />
      <input
        type="text"
        placeholder="Finish room number"
        value={goalValue}
        onChange={(e) => onGoalChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        list="room-numbers"
      />
      <datalist id="room-numbers">
        {roomNumbers.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <button type="button" onClick={onSearch} disabled={searching || !startValue.trim() || !goalValue.trim()}>
        {searching ? "Searching..." : "Find Route"}
      </button>
    </section>
  );
});