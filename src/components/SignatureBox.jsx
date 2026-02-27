import { Rnd } from "react-rnd";

export default function SignatureBox({ sig, update }) {
  return (
    <Rnd
      bounds="parent"
      // Default sizes if sig is undefined
      size={{ 
        width: sig.width || 150, 
        height: sig.height || 50 
      }}
      position={{ 
        x: sig.x_position || 0, 
        y: sig.y_position || 0 
      }}
      onDragStop={(e, d) => {
        update(sig.signer_id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        update(sig.signer_id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          ...pos,
        });
      }}
      enableResizing={{
        bottomRight: true,
      }}
      // Use a rose-colored drag handle to match the theme
      className="z-10"
    >
      <div className="group relative border-2 border-rose-800 bg-rose-50/90 flex items-center justify-center h-full w-full rounded-lg shadow-md cursor-move select-none transition-colors hover:bg-rose-100">
        <span className="text-rose-900 font-bold text-[10px] uppercase tracking-wider">
          Sign Here
        </span>
        
        {/* Visual cue for resizing in the bottom right */}
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-rose-800 opacity-50" />
      </div>
    </Rnd>
  );
}