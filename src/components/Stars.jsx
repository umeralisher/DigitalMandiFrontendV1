export default function Stars({ value = 0, count }) {
  if (!count) return <span className="muted small">No reviews yet</span>;
  return (
    <span className="stars" title={`${value} out of 5`}>
      <span aria-hidden="true">{'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}</span>
      <span className="small"> {value} ({count})</span>
    </span>
  );
}
