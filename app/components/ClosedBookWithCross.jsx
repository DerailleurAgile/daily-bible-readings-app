export default function BookWithCross({ className = "", size = 24 }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
      {/* Christian cross on book cover */}
      <line x1="12" y1="5" x2="12" y2="13" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="8" x2="15" y2="8" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}