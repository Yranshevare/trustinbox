import { cn } from './utils';

export default function TransformLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        `w-6 h-6 bg-primary animate-[morphSpin_2s_ease-in-out_infinite] ${className}`,
      )}
    ></div>
  );
}
