const destinations = [
  { code: "CN", name: "China", color: "#D44A4A" },
  { code: "IN", name: "India", color: "#E9912A" },
  { code: "MY", name: "Malaysia", color: "#159B8C" },
  { code: "KR", name: "South Korea", color: "#4A67B3" },
] as const;

export function JourneyLine({
  ariaLabel = "Four guided study routes from Bangladesh to China, India, Malaysia, and South Korea",
}: {
  ariaLabel?: string;
}) {
  return (
    <div className="journey-line" role="img" aria-label={ariaLabel}>
      <div className="journey-origin">
        <span className="journey-origin-dot" aria-hidden="true" />
        <span>BD</span>
      </div>

      <div className="journey-track" aria-hidden="true">
        <span className="journey-track-line" />
      </div>

      <div className="journey-destinations" aria-hidden="true">
        {destinations.map((destination) => (
          <div className="journey-stop" key={destination.code}>
            <span
              className="journey-stop-dot"
              style={{ backgroundColor: destination.color }}
            />
            <span className="journey-stop-code">{destination.code}</span>
            <span className="sr-only">{destination.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
