export default function OpenBookWithCross({ className = "", size = 24 }) {
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
      <path d="M12 21V7"/>
      <path d="m16 12 2 2 4-4"/>
      <path d="M22 6V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6a1 1 0 0 0 1-1v-1.3"/>
      {/* Christian cross on left page */}
      <line x1="7" y1="8" x2="7" y2="14" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
      <line x1="5" y1="10" x2="9" y2="10" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}