import { Rnd } from "react-rnd";

export default function SignatureBox({ sig, update }) {
  return (
    <Rnd
      bounds="parent"
      size={{ width: sig.width, height: sig.height }}
      position={{ x: sig.x, y: sig.y }}
      onDragStop={(e, d) =>
        update(sig.id, { x: d.x, y: d.y })
      }
      onResizeStop={(e, dir, ref, delta, pos) =>
        update(sig.id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          ...pos,
        })
      }
    >
      <div className="border-2 border-blue-500 h-full w-full">
        Sign
      </div>
    </Rnd>
  );
}