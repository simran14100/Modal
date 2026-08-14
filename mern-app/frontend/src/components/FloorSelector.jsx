import './FloorSelector.css'

const FLOORS = [
  { id: '5', label: '5 Floor', description: 'Operating Theater — 5th Floor' },
  { id: '6', label: '6 Floor', description: 'Operating Theater — 6th Floor' },
]

function FloorSelector({ onSelectFloor, onBack }) {
  return (
    <section className="floor-selector">
      <h1>OT Status Board</h1>
      <p>Select a floor to open the OT status board. Each floor uses its own database.</p>

      <div className="floor-options">
        {FLOORS.map((floor) => (
          <button
            key={floor.id}
            type="button"
            className="floor-option-btn"
            onClick={() => onSelectFloor(floor.id)}
          >
            <span className="floor-option-label">{floor.label}</span>
            <span className="floor-option-desc">{floor.description}</span>
          </button>
        ))}
      </div>

      <button type="button" className="floor-back-btn" onClick={onBack}>
        Back
      </button>
    </section>
  )
}

export default FloorSelector
